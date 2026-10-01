import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

function calculateServerShippingFee(region: string): number {
  switch (region) {
    case 'KTM_VALLEY':
      return 100;
    case 'POKHARA':
    case 'CHITWAN':
      return 150;
    case 'MAJOR_TARAI':
      return 200;
    case 'HILLY_REMOTE':
      return 300;
    default:
      return 150;
  }
}

function normalizeTxId(raw: string): string {
  return String(raw || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

let modelRoundRobinIndex = 0;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Server-Side Payment Screenshot AI/OCR Verification Endpoint
  app.post('/api/verify-payment-screenshot', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        paymentMode = 'online',
        region = 'KTM_VALLEY',
        items = []
      } = req.body || {};

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({
          error: 'Missing payment screenshot image data.'
        });
        return;
      }

      // Compute expected payment amount strictly on the server
      const serverShippingFee = calculateServerShippingFee(String(region));
      const serverProductTotal = Array.isArray(items)
        ? items.reduce((sum: number, item: any) => {
            const itemPrice = Math.max(0, Number(item?.price) || 0);
            return sum + itemPrice;
          }, 0)
        : 0;

      const isCodMode = String(paymentMode).toLowerCase() === 'cod';
      const expectedAmount = isCodMode
        ? serverShippingFee
        : serverProductTotal + serverShippingFee;

      // Strip data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
      const cleanMime =
        typeof mimeType === 'string' && mimeType.startsWith('image/')
          ? mimeType
          : 'image/jpeg';

      const ai = getAiClient();

      const promptText = `You are a financial receipt OCR and visual verification system for an e-commerce store in Nepal (FitYatra).
Analyze the attached image carefully and extract all payment receipt details.

Expected payment amount for this order (${
        isCodMode ? 'Upfront Delivery Charge for Cash on Delivery' : 'Full Online Order Payment'
      }): NPR / Rs. ${expectedAmount}.

Instructions:
1. Determine if this image is genuinely a payment transaction receipt or confirmation screen (such as eSewa, Khalti, Fonepay, Mobile Banking transfer receipt from any Nepalese bank like Nabil, Global IME, NIC Asia, Siddhartha, Sanima, Prabhu, ConnectIPS, or a camera photo of another phone's screen showing a payment receipt).
   - If it is a random photo, selfie, product photo, blank image, or just a standalone QR code without a payment transaction confirmation, set isPaymentReceipt = false.
2. Check if it is a pre-payment confirmation screen BEFORE actual payment completion (e.g., showing "Confirm", "Proceed to Pay", "Send Money" input screen without a completed status or transaction reference). If so, set isPrePaymentScreen = true and extractedStatus = "pre_payment".
3. Evaluate image quality:
   - "clear": Text is legible.
   - "slightly_blurry": Receipt is recognizable, though some text is blurry or low resolution.
   - "unreadable": Image is so blurry/dark/distorted that key details cannot be read at all.
   - "cropped_missing_info": It is a receipt, but cropped/cut off so that the Amount, Status, or Transaction/Reference ID is missing from the frame.
4. Extract:
   - paymentProvider: e.g., "eSewa", "Khalti", "Fonepay", "Mobile Banking", "ConnectIPS", "Bank Transfer", or "Unknown".
   - extractedAmount: The exact numeric paid amount in NPR/Rs (e.g. 100, 150, 2300). Ignore "Remaining Balance" or "Reward Points". If multiple amounts exist (e.g. Amount + 0 charge = Total Amount), use the transaction amount paid. Return null if not visible.
   - extractedStatus: Normalize to one of: "completed" (for Complete, Success, Transaction Successful, Paid, Transferred, Done), "pending", "processing", "failed", "cancelled", "pre_payment", or "unknown".
   - extractedStatusRaw: The exact status wording visible on the screen.
   - transactionId: The Transaction Code, Reference ID, Trace ID, Stan ID, or Idx shown on the receipt. Return empty string "" if missing or unreadable.
   - recipient: The recipient/merchant name or account shown on the receipt (if visible).
   - transactionDateTime: The date and time shown on the receipt (if visible).
   - isPhotoOfScreen: true if this is a camera photo taken of another phone/monitor screen, false if a direct screenshot.
5. Basic Tampering / Fake Detection:
   - Inspect the image for obvious visual manipulation: mismatched fonts or font sizes on the amount digits or transaction ID, pasted text boxes with different background shading, misaligned numbers, or obvious photo-editing artifacts.
   - Set tamperingDetected = true ONLY if specific visual editing/tampering of digits or text is observed, and list specific observations in tamperingReasons.
6. Provide a confidence score (0 to 100) reflecting how legibly the key receipt fields (Amount, Status, Transaction/Reference ID, Provider) can be read (85-100 when Amount, Status, and Transaction ID are clearly legible; 50-79 when blurry or uncertain; 0-49 when unreadable or not a receipt), along with a concise summaryReason.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          isPaymentReceipt: { type: Type.BOOLEAN },
          isPrePaymentScreen: { type: Type.BOOLEAN },
          imageQuality: {
            type: Type.STRING,
            enum: ['clear', 'slightly_blurry', 'unreadable', 'cropped_missing_info']
          },
          paymentProvider: { type: Type.STRING },
          extractedAmount: { type: Type.NUMBER, nullable: true },
          extractedStatus: {
            type: Type.STRING,
            enum: [
              'completed',
              'pending',
              'processing',
              'failed',
              'cancelled',
              'pre_payment',
              'unknown'
            ]
          },
          extractedStatusRaw: { type: Type.STRING },
          transactionId: { type: Type.STRING },
          recipient: { type: Type.STRING },
          transactionDateTime: { type: Type.STRING },
          isPhotoOfScreen: { type: Type.BOOLEAN },
          tamperingDetected: { type: Type.BOOLEAN },
          tamperingReasons: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          confidence: { type: Type.NUMBER },
          summaryReason: { type: Type.STRING }
        },
        required: [
          'isPaymentReceipt',
          'isPrePaymentScreen',
          'imageQuality',
          'paymentProvider',
          'extractedStatus',
          'extractedStatusRaw',
          'transactionId',
          'recipient',
          'transactionDateTime',
          'isPhotoOfScreen',
          'tamperingDetected',
          'tamperingReasons',
          'confidence',
          'summaryReason'
        ]
      };

      const jsonPrompt = `${promptText}

Return ONLY a valid JSON object matching this exact structure:
{
  "isPaymentReceipt": boolean,
  "isPrePaymentScreen": boolean,
  "imageQuality": "clear" | "slightly_blurry" | "unreadable" | "cropped_missing_info",
  "paymentProvider": string,
  "extractedAmount": number | null,
  "extractedStatus": "completed" | "pending" | "processing" | "failed" | "cancelled" | "pre_payment" | "unknown",
  "extractedStatusRaw": string,
  "transactionId": string,
  "recipient": string,
  "transactionDateTime": string,
  "isPhotoOfScreen": boolean,
  "tamperingDetected": boolean,
  "tamperingReasons": string[],
  "confidence": number,
  "summaryReason": string
}`;

      let responseText = '';
      const modelPool = [
        'gemini-3-flash-preview',
        'gemini-flash-lite-latest',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-3.8-flash'
      ];
      const startIdx = modelRoundRobinIndex % modelPool.length;
      modelRoundRobinIndex = (modelRoundRobinIndex + 1) % modelPool.length;

      let parsed: Record<string, any> | null = null;
      let lastAiError: any = null;

      for (let attempt = 0; attempt < modelPool.length; attempt++) {
        const modelName = modelPool[(startIdx + attempt) % modelPool.length];
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: cleanBase64
                  }
                },
                { text: jsonPrompt }
              ]
            },
            config: {
              responseMimeType: 'application/json',
              temperature: 0.1
            }
          });
          responseText = (response.text || '').trim();
          if (responseText) {
            const cleanedJson = responseText
              .replace(/^```(?:json)?\s*/i, '')
              .replace(/\s*```$/i, '')
              .trim();
            const firstBrace = cleanedJson.indexOf('{');
            const lastBrace = cleanedJson.lastIndexOf('}');
            const jsonSlice =
              firstBrace !== -1 && lastBrace > firstBrace
                ? cleanedJson.slice(firstBrace, lastBrace + 1)
                : cleanedJson;
            parsed = JSON.parse(jsonSlice);
            if (parsed && typeof parsed === 'object') {
              break;
            }
          }
        } catch (err: any) {
          lastAiError = err;
          console.warn(`Attempt ${attempt + 1} (${modelName}) notice:`, err?.status || err?.message);
          if (attempt < modelPool.length - 1) {
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }

      if (!parsed) {
        console.warn('All AI vision attempts busy; routing to pending_review:', lastAiError);
        res.json({
          decision: 'pending_review',
          isPaymentReceipt: true,
          isPrePaymentScreen: false,
          imageQuality: 'clear',
          paymentProvider: 'Pending Review',
          extractedAmount: null,
          expectedAmount,
          amountMatches: false,
          extractedStatus: 'unknown',
          extractedStatusRaw: 'Pending Admin Verification',
          transactionId: '',
          normalizedTransactionId: '',
          recipient: '',
          transactionDateTime: '',
          isPhotoOfScreen: false,
          tamperingDetected: false,
          tamperingReasons: [],
          confidence: 0,
          reasons: [
            'AI vision service experienced temporary high demand; receipt automatically queued for manual admin verification.'
          ],
          summaryReason:
            'Receipt uploaded and queued for manual admin verification.'
        });
        return;
      }

      const isPaymentReceipt = Boolean(parsed.isPaymentReceipt);
      const isPrePaymentScreen = Boolean(parsed.isPrePaymentScreen);
      const imageQuality: 'clear' | 'slightly_blurry' | 'unreadable' | 'cropped_missing_info' =
        parsed.imageQuality || 'clear';
      const paymentProvider = String(parsed.paymentProvider || 'Unknown').trim();
      const rawAmount =
        typeof parsed.extractedAmount === 'number'
          ? parsed.extractedAmount
          : typeof parsed.extractedAmount === 'string' && parsed.extractedAmount.trim() !== ''
          ? parseFloat(parsed.extractedAmount.replace(/[^0-9.]/g, ''))
          : NaN;
      const extractedAmount = !Number.isNaN(rawAmount) ? rawAmount : null;
      const rawStatus = String(parsed.extractedStatus || 'unknown').toLowerCase().trim();
      const extractedStatus:
        | 'completed'
        | 'pending'
        | 'processing'
        | 'failed'
        | 'cancelled'
        | 'pre_payment'
        | 'unknown' =
        rawStatus === 'completed' ||
        rawStatus === 'complete' ||
        rawStatus === 'success' ||
        rawStatus === 'successful' ||
        rawStatus === 'paid'
          ? 'completed'
          : rawStatus === 'pending'
          ? 'pending'
          : rawStatus === 'processing'
          ? 'processing'
          : rawStatus === 'failed'
          ? 'failed'
          : rawStatus === 'cancelled' || rawStatus === 'canceled'
          ? 'cancelled'
          : rawStatus === 'pre_payment'
          ? 'pre_payment'
          : 'unknown';
      const extractedStatusRaw = String(
        parsed.extractedStatusRaw || parsed.extractedStatus || ''
      ).trim();
      const transactionId = String(parsed.transactionId || '').trim();
      const normalizedTransactionId = normalizeTxId(transactionId);
      const recipient = String(parsed.recipient || '').trim();
      const transactionDateTime = String(parsed.transactionDateTime || '').trim();
      const isPhotoOfScreen = Boolean(parsed.isPhotoOfScreen);
      const tamperingDetected = Boolean(parsed.tamperingDetected);
      const tamperingReasons: string[] = Array.isArray(parsed.tamperingReasons)
        ? parsed.tamperingReasons.map((r: any) => String(r))
        : [];
      const rawConfidence = Number(parsed.confidence);
      const confidence = !Number.isNaN(rawConfidence)
        ? Math.max(0, Math.min(100, Math.round(rawConfidence)))
        : 85;

      const amountMatches =
        extractedAmount !== null && Math.abs(extractedAmount - expectedAmount) <= 0.5;

      const reasons: string[] = [];
      let decision: 'verified' | 'pending_review' | 'rejected' = 'pending_review';

      // THREE-WAY DECISION LOGIC
      if (
        imageQuality === 'cropped_missing_info' &&
        (extractedAmount === null || !normalizedTransactionId)
      ) {
        decision = 'rejected';
        reasons.push(
          'Cropped screenshot is missing critical information (Amount or Transaction/Reference ID). Please upload the full, uncropped payment receipt.'
        );
      } else if (!isPaymentReceipt) {
        decision = 'rejected';
        reasons.push(
          'Uploaded image is not a valid payment receipt. Please upload a screenshot of your completed payment confirmation.'
        );
      } else if (isPrePaymentScreen || extractedStatus === 'pre_payment') {
        decision = 'rejected';
        reasons.push(
          'This screenshot shows a pre-payment confirmation screen before payment completion. Please complete the payment and upload the final receipt.'
        );
      } else if (extractedStatus === 'failed' || extractedStatus === 'cancelled') {
        decision = 'rejected';
        reasons.push(
          `Payment receipt shows a ${extractedStatus.toUpperCase()} transaction (${
            extractedStatusRaw || extractedStatus
          }). Only completed/successful payments are accepted.`
        );
      } else if (extractedStatus === 'pending' || extractedStatus === 'processing') {
        decision = 'rejected';
        reasons.push(
          `Payment status on receipt is ${extractedStatus.toUpperCase()}. Please upload the receipt once the payment is completed.`
        );
      } else if (imageQuality === 'unreadable' && extractedAmount === null) {
        decision = 'rejected';
        reasons.push(
          'Screenshot is too blurry or unreadable to verify payment details. Please upload a clearer screenshot.'
        );
      } else if (extractedAmount !== null && !amountMatches) {
        decision = 'rejected';
        reasons.push(
          `Payment amount mismatch: receipt shows Rs. ${extractedAmount.toLocaleString(
            'en-US'
          )}, but required ${
            isCodMode ? 'upfront delivery charge' : 'order total'
          } is Rs. ${expectedAmount.toLocaleString('en-US')}.`
        );
      } else if (tamperingDetected && confidence >= 85) {
        decision = 'rejected';
        reasons.push(
          `Receipt rejected due to suspected visual editing/manipulation: ${
            tamperingReasons.join('; ') || 'Altered text/digits detected'
          }.`
        );
      } else {
        // Not rejected -> Determine whether VERIFIED or PENDING ADMIN REVIEW
        if (tamperingDetected) {
          reasons.push(
            `Flagged for admin review (possible editing/layout anomaly): ${
              tamperingReasons.join('; ') || 'Visual anomaly noticed'
            }`
          );
        }
        if (extractedAmount === null) {
          reasons.push('Amount could not be read with 100% certainty; queued for admin review.');
        }
        if (!normalizedTransactionId || normalizedTransactionId.length < 3) {
          reasons.push(
            'Transaction/Reference ID could not be clearly extracted; queued for admin review.'
          );
        }
        if (extractedStatus !== 'completed') {
          reasons.push(
            `Payment completion status uncertain (${
              extractedStatusRaw || extractedStatus
            }); queued for admin review.`
          );
        }
        if (imageQuality === 'slightly_blurry' || imageQuality === 'unreadable') {
          reasons.push('Screenshot is slightly blurry; queued for admin review.');
        }
        if (imageQuality === 'cropped_missing_info') {
          reasons.push('Screenshot appears partially cropped; queued for admin review.');
        }
        if (isPhotoOfScreen) {
          reasons.push('Image is a camera photo of another screen.');
        }
        if (confidence < 80) {
          reasons.push(`AI verification confidence is moderate (${confidence}%).`);
        }

        const canAutoVerify =
          isPaymentReceipt &&
          !isPrePaymentScreen &&
          extractedStatus === 'completed' &&
          amountMatches &&
          normalizedTransactionId.length >= 3 &&
          !tamperingDetected &&
          imageQuality === 'clear' &&
          confidence >= 80;

        if (canAutoVerify) {
          decision = 'verified';
          reasons.push(
            `Verified ${paymentProvider} receipt of Rs. ${expectedAmount.toLocaleString(
              'en-US'
            )} (Ref: ${transactionId}).`
          );
        } else {
          decision = 'pending_review';
        }
      }

      const result = {
        decision,
        isPaymentReceipt,
        isPrePaymentScreen,
        imageQuality,
        paymentProvider,
        extractedAmount,
        expectedAmount,
        amountMatches,
        extractedStatus,
        extractedStatusRaw,
        transactionId,
        normalizedTransactionId,
        recipient,
        transactionDateTime,
        isPhotoOfScreen,
        tamperingDetected,
        tamperingReasons,
        confidence,
        reasons,
        summaryReason:
          reasons[0] ||
          String(parsed.summaryReason || 'Receipt analyzed by AI verification system.')
      };

      res.json(result);
    } catch (error: any) {
      console.error('Error in /api/verify-payment-screenshot:', error);
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to analyze payment screenshot on server.'
      });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitYatra full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

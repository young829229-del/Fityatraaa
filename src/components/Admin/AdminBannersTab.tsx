import { useState, useEffect, useRef, ChangeEvent } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Check,
  Eye,
  EyeOff,
  Video,
  Upload,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { StoreBanner, StoreSettings } from '../../types';
import ImageUploader from './ImageUploader';
import { uploadFileToStorage } from '../../services/storageService';

interface AdminBannersTabProps {
  banners: StoreBanner[];
  onSaveBanner: (banner: StoreBanner) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
  storeSettings?: StoreSettings | null;
  onUpdateStoreSettings?: (updates: Partial<StoreSettings>) => Promise<void>;
}

const DEFAULT_REDEFINE_VIDEO =
  'https://res.cloudinary.com/drefcs4o2/video/upload/v1772786558/AQN7bb300k16e4a823562133089a70f6f743831e4d4d139d09c4409986d60900c7026444233380473110008057761_1_fd9n1h.mp4';
const DEFAULT_REDEFINE_POSTER =
  'https://i.ibb.co/SwK21D9p/Screenshot-2026-03-06-14-31-10-49-40deb401b9ffe8e1df2f1cc5ba480b12.jpg';

export default function AdminBannersTab({
  banners,
  onSaveBanner,
  onDeleteBanner,
  storeSettings,
  onUpdateStoreSettings
}: AdminBannersTabProps) {
  const [localBanners, setLocalBanners] = useState<StoreBanner[]>(banners);
  const [dirtyBannerIds, setDirtyBannerIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingBannerVideoId, setUploadingBannerVideoId] = useState<string | null>(null);
  const [bannerVideoUploadProgress, setBannerVideoUploadProgress] = useState<number>(0);

  // Redefine Yourself Video section state
  const [redefineHeading, setRedefineHeading] = useState<string>(
    storeSettings?.redefineVideoHeading || 'Redefine Yourself'
  );
  const [redefineVideoUrl, setRedefineVideoUrl] = useState<string>(
    storeSettings?.redefineVideoUrl || DEFAULT_REDEFINE_VIDEO
  );
  const [redefinePosterUrl, setRedefinePosterUrl] = useState<string>(
    storeSettings?.redefineVideoPosterUrl || DEFAULT_REDEFINE_POSTER
  );
  const [redefineEnabled, setRedefineEnabled] = useState<boolean>(
    storeSettings?.redefineVideoEnabled ?? true
  );
  const [announcementText, setAnnouncementText] = useState<string>(
    storeSettings?.announcementText || 'Make Health Better Again'
  );
  const [settingsDirty, setSettingsDirty] = useState(false);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoSaved, setVideoSaved] = useState(false);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalBanners((prev) => {
      if (dirtyBannerIds.size === 0) return banners;
      const prevMap = new Map(prev.map((b) => [b.id, b]));
      return banners.map((incoming) =>
        dirtyBannerIds.has(incoming.id) && prevMap.has(incoming.id)
          ? prevMap.get(incoming.id)!
          : incoming
      );
    });
  }, [banners, dirtyBannerIds]);

  useEffect(() => {
    if (storeSettings && !settingsDirty) {
      setRedefineHeading(storeSettings.redefineVideoHeading || 'Redefine Yourself');
      setRedefineVideoUrl(storeSettings.redefineVideoUrl || DEFAULT_REDEFINE_VIDEO);
      setRedefinePosterUrl(storeSettings.redefineVideoPosterUrl || DEFAULT_REDEFINE_POSTER);
      setRedefineEnabled(storeSettings.redefineVideoEnabled ?? true);
      setAnnouncementText(storeSettings.announcementText || 'Make Health Better Again');
    }
  }, [storeSettings, settingsDirty]);

  const handleFieldChange = (id: string, field: keyof StoreBanner, value: any) => {
    setDirtyBannerIds((prev) => new Set(prev).add(id));
    setLocalBanners((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSingleBanner = async (banner: StoreBanner) => {
    setSavingId(banner.id);
    setSaveError(null);
    try {
      await onSaveBanner(banner);
      setDirtyBannerIds((prev) => {
        const next = new Set(prev);
        next.delete(banner.id);
        return next;
      });
      setSavedId(banner.id);
      setTimeout(() => setSavedId(null), 2500);
    } catch (err: any) {
      console.error('Failed to save banner:', err);
      setSaveError(err?.message || 'Failed to save banner changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingId('all');
    setSaveError(null);
    try {
      for (const b of localBanners) {
        await onSaveBanner(b);
      }
      if (onUpdateStoreSettings) {
        await onUpdateStoreSettings({
          redefineVideoHeading: redefineHeading.trim() || 'Redefine Yourself',
          redefineVideoUrl: redefineVideoUrl.trim() || DEFAULT_REDEFINE_VIDEO,
          redefineVideoPosterUrl: redefinePosterUrl.trim(),
          redefineVideoEnabled: redefineEnabled,
          announcementText: announcementText.trim() || 'Make Health Better Again'
        });
      }
      setDirtyBannerIds(new Set());
      setSettingsDirty(false);
      setSavedId('all');
      setTimeout(() => setSavedId(null), 3000);
    } catch (err: any) {
      console.error('Failed to save banners:', err);
      setSaveError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const handleAddBanner = async () => {
    const newBanner: StoreBanner = {
      id: `banner_${Date.now()}`,
      title: 'NEW CAMPAIGN BANNER',
      subtitle: '100% Authentic Supplements with Free KTM Valley Shipping',
      imageUrl: 'https://i.ibb.co/DFnZ5Fy/Phone-Version-4-1-1-1.jpg',
      videoUrl: '',
      buttonText: 'Shop Now',
      buttonLink: '#catalog',
      enabled: true,
      displayOrder: localBanners.length + 1,
      displayLocation: 'hero',
      createdAt: new Date().toISOString()
    };
    setSaveError(null);
    try {
      await onSaveBanner(newBanner);
    } catch (err: any) {
      console.error('Failed to add banner:', err);
      setSaveError(err?.message || 'Failed to add banner.');
    }
  };

  const handleBannerVideoFileUpload = async (
    bannerId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerVideoId(bannerId);
    setBannerVideoUploadProgress(10);
    setSaveError(null);
    try {
      const res = await uploadFileToStorage(file, 'banners/videos', (pct) =>
        setBannerVideoUploadProgress(pct)
      );
      if (res.url) {
        handleFieldChange(bannerId, 'videoUrl', res.url);
        const target = localBanners.find((b) => b.id === bannerId);
        if (target) {
          await handleSaveSingleBanner({ ...target, videoUrl: res.url });
        }
      }
    } catch (err: any) {
      console.error('Banner video upload failed:', err);
      setSaveError('Failed to upload banner video. Please try again.');
    } finally {
      setUploadingBannerVideoId(null);
      e.target.value = '';
    }
  };

  const handleRedefineVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setVideoUploadProgress(10);
    setSaveError(null);
    try {
      const res = await uploadFileToStorage(file, 'videos/redefine', (pct) =>
        setVideoUploadProgress(pct)
      );
      if (res.url) {
        setRedefineVideoUrl(res.url);
        if (onUpdateStoreSettings) {
          await onUpdateStoreSettings({
            redefineVideoUrl: res.url,
            redefineVideoHeading: redefineHeading.trim() || 'Redefine Yourself',
            redefineVideoPosterUrl: redefinePosterUrl.trim(),
            redefineVideoEnabled: redefineEnabled
          });
          setVideoSaved(true);
          setTimeout(() => setVideoSaved(false), 3000);
        }
      }
    } catch (err) {
      console.error('Redefine video upload failed:', err);
      setSaveError('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleSaveRedefineSection = async () => {
    if (!onUpdateStoreSettings) return;
    setIsSavingVideo(true);
    setSaveError(null);
    try {
      await onUpdateStoreSettings({
        redefineVideoHeading: redefineHeading.trim() || 'Redefine Yourself',
        redefineVideoUrl: redefineVideoUrl.trim() || DEFAULT_REDEFINE_VIDEO,
        redefineVideoPosterUrl: redefinePosterUrl.trim(),
        redefineVideoEnabled: redefineEnabled,
        announcementText: announcementText.trim() || 'Make Health Better Again'
      });
      setSettingsDirty(false);
      setVideoSaved(true);
      setTimeout(() => setVideoSaved(false), 3000);
    } catch (err: any) {
      console.error('Failed to save store settings:', err);
      setSaveError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setIsSavingVideo(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#FFCD00]" />
            Homepage Banners, Videos &amp; Promotional Media
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Upload and manage Hero Banners, Product Promo Banners, and the &ldquo;Redefine Yourself&rdquo; video section.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddBanner}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFCD00] hover:bg-[#ffe04d] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Banner</span>
        </button>
      </div>

      {/* Error Alert Banner */}
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-xs text-red-300 font-bold">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. REDEFINE YOURSELF HOMEPAGE VIDEO SECTION MANAGER */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFCD00]/15 border border-[#FFCD00]/30 flex items-center justify-center text-[#FFCD00]">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-white">
                &ldquo;Redefine Yourself&rdquo; Homepage Video &amp; Announcement Bar
              </h4>
              <p className="text-xs text-neutral-400">
                Manage the full-width vertical/portrait video showcase and top announcement bar text.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSettingsDirty(true);
                setRedefineEnabled(!redefineEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                redefineEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {redefineEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{redefineEnabled ? 'Visible on Home' : 'Hidden'}</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRedefineSection}
              disabled={isSavingVideo || uploadingVideo}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#FFCD00] hover:bg-[#ffe04d] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {videoSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-900" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSavingVideo ? 'Saving...' : 'Save Video Settings'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Preview Column */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 self-start">
              Live Video Preview
            </span>
            <div className="w-full max-w-[240px] aspect-[9/16] rounded-xl overflow-hidden bg-black border border-neutral-800 relative shadow-lg">
              {redefineVideoUrl ? (
                <video
                  key={redefineVideoUrl}
                  src={redefineVideoUrl}
                  poster={redefinePosterUrl || undefined}
                  controls
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500">
                  No Video Selected
                </div>
              )}
            </div>
          </div>

          {/* Video Upload & Settings Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Section Heading Title
                </label>
                <input
                  type="text"
                  value={redefineHeading}
                  onChange={(e) => {
                    setSettingsDirty(true);
                    setRedefineHeading(e.target.value);
                  }}
                  placeholder="Redefine Yourself"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#FFCD00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Top Announcement Bar Text
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => {
                    setSettingsDirty(true);
                    setAnnouncementText(e.target.value);
                  }}
                  placeholder="Make Health Better Again"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#FFCD00]"
                />
              </div>
            </div>

            {/* Direct Video File Upload */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-300">
                  Video Source (Upload MP4/WebM or Paste Direct Video URL)
                </label>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime,video/*"
                  onChange={handleRedefineVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={uploadingVideo}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFCD00] hover:bg-[#ffe04d] text-black font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {uploadingVideo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading {videoUploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Video File</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="url"
                value={redefineVideoUrl}
                onChange={(e) => {
                  setSettingsDirty(true);
                  setRedefineVideoUrl(e.target.value);
                }}
                placeholder="https://... (.mp4 or video URL)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 font-mono focus:outline-none focus:border-[#FFCD00]"
              />
            </div>

            {/* Poster Thumbnail Image Uploader */}
            <div className="pt-1">
              <ImageUploader
                label="Video Cover / Poster Thumbnail Image"
                images={redefinePosterUrl ? [redefinePosterUrl] : []}
                multiple={false}
                maxFiles={1}
                onChange={(urls) => {
                  setSettingsDirty(true);
                  setRedefinePosterUrl(urls[0] || '');
                }}
                folder="banners/posters"
                aspectRatio="wide"
                helperText="Displayed while the video loads or before playback starts."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL BANNERS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {localBanners.map((banner) => (
          <div
            key={banner.id}
            className={`bg-neutral-900 border rounded-2xl p-5 space-y-4 transition-all ${
              banner.enabled ? 'border-neutral-800' : 'border-neutral-800/40 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#FFCD00]/15 text-[#FFCD00] border border-[#FFCD00]/30">
                  {banner.displayLocation === 'hero'
                    ? 'Homepage Hero'
                    : banner.displayLocation === 'product_promo'
                    ? 'Product Page Promo'
                    : 'Announcement Popup'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const updated = { ...banner, enabled: !banner.enabled };
                    handleFieldChange(banner.id, 'enabled', updated.enabled);
                    await handleSaveSingleBanner(updated);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                    banner.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {banner.enabled ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteBanner(banner.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Banner Image Uploader */}
            <ImageUploader
              label="Banner Graphic (Uploads to Firebase Storage)"
              images={banner.imageUrl ? [banner.imageUrl] : []}
              multiple={false}
              maxFiles={1}
              onChange={async (urls) => {
                const url = urls[0] || '';
                const updated = { ...banner, imageUrl: url };
                handleFieldChange(banner.id, 'imageUrl', url);
                await handleSaveSingleBanner(updated);
              }}
              folder="banners"
              aspectRatio="wide"
            />

            {/* Optional Banner Background Video */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#FFCD00]" />
                  <span>Optional Banner Video (MP4 / URL)</span>
                </label>
                <label className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-[10px] font-bold uppercase rounded cursor-pointer transition-colors inline-flex items-center gap-1">
                  {uploadingBannerVideoId === banner.id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-[#FFCD00]" />
                      <span>{bannerVideoUploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 text-[#FFCD00]" />
                      <span>Upload Video</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={(e) => handleBannerVideoFileUpload(banner.id, e)}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                value={banner.videoUrl || ''}
                onChange={(e) => handleFieldChange(banner.id, 'videoUrl', e.target.value)}
                placeholder="Optional video URL (leave blank to use banner image)"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-[#FFCD00]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Headline Title
                </label>
                <input
                  type="text"
                  value={banner.title}
                  onChange={(e) => handleFieldChange(banner.id, 'title', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#FFCD00]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Subtitle / Campaign Offer
                </label>
                <input
                  type="text"
                  value={banner.subtitle || ''}
                  onChange={(e) => handleFieldChange(banner.id, 'subtitle', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFCD00]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  Placement Location
                </label>
                <select
                  value={banner.displayLocation}
                  onChange={(e) =>
                    handleFieldChange(banner.id, 'displayLocation', e.target.value)
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFCD00]"
                >
                  <option value="hero">Homepage Hero Banner</option>
                  <option value="product_promo">Product Page Promo Banner</option>
                  <option value="popup">Storefront Offer Highlight</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                  CTA Button Text
                </label>
                <input
                  type="text"
                  value={banner.buttonText || ''}
                  onChange={(e) => handleFieldChange(banner.id, 'buttonText', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FFCD00]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => handleSaveSingleBanner(banner)}
                disabled={savingId === banner.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                {savedId === banner.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-[#FFCD00]" />
                    <span>{savingId === banner.id ? 'Saving...' : 'Save Banner'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Action Footer */}
      <div className="flex justify-end bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={savingId !== null}
          className="flex items-center gap-2 px-6 py-3 bg-[#FFCD00] hover:bg-[#ffe04d] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg"
        >
          {savedId === 'all' ? (
            <>
              <Check className="w-4 h-4 text-emerald-900" />
              <span>Saved to Firebase</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{savingId === 'all' ? 'Saving...' : 'Save All Banner Changes'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

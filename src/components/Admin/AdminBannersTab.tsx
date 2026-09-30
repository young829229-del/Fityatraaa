import { useState, useRef, useEffect, ChangeEvent } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Save,
  ArrowUp,
  ArrowDown,
  Video,
  Upload,
  Loader2,
  Film,
  RefreshCw
} from 'lucide-react';
import { StoreBanner, StoreSettings } from '../../types';
import ImageUploader from './ImageUploader';
import { uploadFileToStorage, useResolvedMediaUrl } from '../../services/storageService';

interface AdminBannersTabProps {
  banners: StoreBanner[];
  storeSettings?: StoreSettings;
  onUpdateStoreSettings?: (updates: Partial<StoreSettings>) => Promise<void>;
  onSaveBanner: (banner: StoreBanner) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
}

function ResolvedVideoPlayer({
  videoUrl,
  posterUrl,
  className = 'w-full h-full object-cover rounded-lg bg-black'
}: {
  videoUrl?: string;
  posterUrl?: string;
  className?: string;
}) {
  const resolvedVideo = useResolvedMediaUrl(videoUrl);
  const resolvedPoster = useResolvedMediaUrl(posterUrl);
  if (!resolvedVideo) return null;
  return (
    <video
      src={resolvedVideo}
      poster={resolvedPoster || undefined}
      controls
      playsInline
      className={className}
    />
  );
}

export default function AdminBannersTab({
  banners = [],
  storeSettings,
  onUpdateStoreSettings,
  onSaveBanner,
  onDeleteBanner
}: AdminBannersTabProps) {
  const [editingBanners, setEditingBanners] = useState<StoreBanner[]>(banners);
  const [savedBannerId, setSavedBannerId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null);
  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Homepage "Redefine / Modify Yourself" Video & Announcement Bar state synced with Firestore storeSettings
  const [announcementText, setAnnouncementText] = useState<string>(
    storeSettings?.announcementText || 'Make Health Better Again'
  );
  const [videoHeading, setVideoHeading] = useState<string>(
    storeSettings?.redefineVideoHeading || 'Redefine Yourself'
  );
  const [videoUrl, setVideoUrl] = useState<string>(storeSettings?.redefineVideoUrl || '');
  const [videoPosterUrl, setVideoPosterUrl] = useState<string>(
    storeSettings?.redefineVideoPosterUrl || ''
  );
  const [videoEnabled, setVideoEnabled] = useState<boolean>(
    storeSettings?.redefineVideoEnabled !== false
  );
  const [uploadingMainVideo, setUploadingMainVideo] = useState<boolean>(false);
  const [mainVideoProgress, setMainVideoProgress] = useState<number>(0);
  const [mainVideoSaved, setMainVideoSaved] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const mainVideoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditingBanners(banners);
  }, [banners]);

  useEffect(() => {
    if (storeSettings) {
      setAnnouncementText(storeSettings.announcementText || 'Make Health Better Again');
      setVideoHeading(storeSettings.redefineVideoHeading || 'Redefine Yourself');
      setVideoUrl(storeSettings.redefineVideoUrl || '');
      setVideoPosterUrl(storeSettings.redefineVideoPosterUrl || '');
      setVideoEnabled(storeSettings.redefineVideoEnabled !== false);
    }
  }, [storeSettings]);

  const handleMainVideoFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMainVideo(true);
    setMainVideoProgress(10);
    try {
      const res = await uploadFileToStorage(file, 'homepage_video', (pct) => {
        setMainVideoProgress(pct);
      });
      if (res.url) {
        setVideoUrl(res.url);
        if (onUpdateStoreSettings) {
          await onUpdateStoreSettings({
            redefineVideoUrl: res.url,
            redefineVideoPosterUrl: videoPosterUrl,
            redefineVideoHeading: videoHeading,
            redefineVideoEnabled: videoEnabled
          });
          setMainVideoSaved(true);
          setTimeout(() => setMainVideoSaved(false), 2500);
        }
      }
    } catch (err) {
      console.error('Homepage video upload error:', err);
    } finally {
      setUploadingMainVideo(false);
      setMainVideoProgress(0);
      if (mainVideoInputRef.current) {
        mainVideoInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMainVideo = async () => {
    setVideoUrl('');
    if (onUpdateStoreSettings) {
      await onUpdateStoreSettings({
        redefineVideoUrl: ''
      });
      setMainVideoSaved(true);
      setTimeout(() => setMainVideoSaved(false), 2500);
    }
  };

  const handleSaveMainVideoSettings = async () => {
    if (!onUpdateStoreSettings) return;
    setSaveError(null);
    try {
      await onUpdateStoreSettings({
        announcementText: announcementText.trim() || 'Make Health Better Again',
        redefineVideoUrl: videoUrl,
        redefineVideoPosterUrl: videoPosterUrl,
        redefineVideoHeading: videoHeading,
        redefineVideoEnabled: videoEnabled
      });
      setMainVideoSaved(true);
      setTimeout(() => setMainVideoSaved(false), 2500);
    } catch (err: any) {
      console.error('Failed to save store settings to Firebase:', err);
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  const handleUpdate = (id: string, field: keyof StoreBanner, value: any) => {
    setEditingBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const handleSave = async (banner: StoreBanner) => {
    setSaveError(null);
    try {
      await onSaveBanner(banner);
      setSavedBannerId(banner.id);
      setTimeout(() => setSavedBannerId(null), 2500);
    } catch (err: any) {
      console.error('Failed to save banner to Firebase:', err);
      setSaveError('Failed to save changes. Please try again.');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= editingBanners.length) return;
    const next = [...editingBanners];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    const reordered = next.map((b, i) => ({ ...b, displayOrder: i + 1 }));
    setEditingBanners(reordered);
    for (const b of reordered) {
      await onSaveBanner(b);
    }
  };

  const handleBannerVideoUpload = async (bannerId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideoId(bannerId);
    try {
      const res = await uploadFileToStorage(file, `banners/${bannerId}/video`);
      if (res.url) {
        handleUpdate(bannerId, 'videoUrl', res.url);
      }
    } catch (err) {
      console.error('Banner video upload error:', err);
    } finally {
      setUploadingVideoId(null);
    }
  };

  const handleAddNewBanner = () => {
    const newBanner: StoreBanner = {
      id: `banner-${Date.now()}`,
      title: 'FUEL YOUR POTENTIAL • REPAIR & GROW',
      subtitle: 'Premium lab-tested supplements delivered anywhere in Nepal.',
      imageUrl: '',
      videoUrl: '',
      buttonText: 'Buy Now',
      buttonLink: '#catalog',
      enabled: true,
      displayOrder: editingBanners.length + 1,
      displayLocation: 'product_promo',
      createdAt: new Date().toISOString()
    };
    setEditingBanners([...editingBanners, newBanner]);
  };

  return (
    <div className="space-y-6">
      {saveError && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-xs font-bold">
          {saveError}
        </div>
      )}
      {/* 1. HOMEPAGE "MODIFY / REDEFINE YOURSELF" VIDEO MANAGER */}
      <div className="bg-white rounded-2xl border-2 border-neutral-900 shadow-xs p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-[#FFCD00] flex items-center justify-center shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-neutral-950 tracking-tight">
                Homepage Showcase Video (&ldquo;Redefine / Modify Yourself&rdquo;)
              </h2>
              <p className="text-xs text-neutral-500">
                Upload, replace, preview, or remove the main athlete video displayed on the public homepage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-neutral-700">
              {videoEnabled ? 'Visible on Homepage' : 'Hidden'}
            </span>
            <button
              type="button"
              onClick={async () => {
                const next = !videoEnabled;
                setVideoEnabled(next);
                if (onUpdateStoreSettings) {
                  await onUpdateStoreSettings({ redefineVideoEnabled: next });
                }
              }}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                videoEnabled ? 'bg-emerald-500' : 'bg-neutral-300'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform ${
                  videoEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Video Upload + Live Video Player Preview */}
          <div className="md:col-span-6 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-neutral-700" />
                <span>Video File</span>
              </span>

              <input
                type="file"
                accept="video/*"
                ref={mainVideoInputRef}
                onChange={handleMainVideoFileUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => mainVideoInputRef.current?.click()}
                  disabled={uploadingMainVideo}
                  className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-black uppercase rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {uploadingMainVideo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FFCD00]" />
                      <span>Uploading {mainVideoProgress}%...</span>
                    </>
                  ) : videoUrl ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#FFCD00]" />
                      <span>Replace Video</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#FFCD00]" />
                      <span>+ Upload New Video</span>
                    </>
                  )}
                </button>

                {videoUrl && !uploadingMainVideo && (
                  <button
                    type="button"
                    onClick={handleRemoveMainVideo}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                    title="Remove current video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>

            {uploadingMainVideo && (
              <div className="w-full bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-amber-900">
                  <span>Saving video to database...</span>
                  <span>{mainVideoProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-200"
                    style={{ width: `${mainVideoProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video Preview Box */}
            {videoUrl ? (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block">
                  ✓ Live Uploaded Video Preview
                </span>
                <div className="w-full max-w-[240px] mx-auto aspect-[9/14] rounded-2xl overflow-hidden bg-black border border-neutral-300 shadow-md">
                  <ResolvedVideoPlayer
                    videoUrl={videoUrl}
                    posterUrl={videoPosterUrl}
                    className="w-full h-full object-cover bg-black"
                  />
                </div>
              </div>
            ) : (
              <div
                onClick={() => mainVideoInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 hover:border-neutral-900 rounded-xl p-8 text-center cursor-pointer bg-white transition-colors"
              >
                <Video className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-800">
                  No video file uploaded yet
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Click &ldquo;+ Upload New Video&rdquo; to select an MP4 / WebM / MOV video from your device.
                </p>
              </div>
            )}
          </div>

          {/* Right: Section Title, Announcement Bar & Optional Cover Thumbnail Upload */}
          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                Top Announcement Bar Text
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Make Health Better Again"
                className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 block mb-1">
                Video Section Heading
              </label>
              <input
                type="text"
                value={videoHeading}
                onChange={(e) => setVideoHeading(e.target.value)}
                placeholder="Redefine Yourself"
                className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              <ImageUploader
                label="Video Cover Thumbnail / Poster Image"
                folder="homepage_video_poster"
                images={videoPosterUrl ? [videoPosterUrl] : []}
                onChange={(urls) => setVideoPosterUrl(urls[0] || '')}
                multiple={false}
                maxFiles={1}
                aspectRatio="tall"
                helperText="Displayed as the cover image before the visitor presses Play."
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveMainVideoSettings}
                className={`px-5 py-2.5 text-xs font-black uppercase rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  mainVideoSaved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white'
                }`}
              >
                {mainVideoSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved Live to Website!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#FFCD00]" />
                    <span>Save Video Section</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROMOTIONAL BANNERS HEADER */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Promotional Banners
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage Hero banners and Product Page promotional banners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddNewBanner}
          className="bg-neutral-950 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#FFCD00]" />
          <span>+ Add Banner</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {editingBanners.length === 0 ? (
          <div className="bg-white p-12 text-center text-neutral-400 text-xs rounded-2xl border border-neutral-200">
            No banners configured yet. Click &ldquo;+ Add Banner&rdquo; to create a new promotional graphic or video.
          </div>
        ) : (
          editingBanners.map((banner, idx) => {
            const isSaved = savedBannerId === banner.id;

            return (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-5 space-y-4"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-neutral-900">
                      #{idx + 1} • {banner.title || 'Untitled Banner'}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                      {banner.displayLocation}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Banner Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMoveOrder(idx, 'down')}
                      disabled={idx === editingBanners.length - 1}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded disabled:opacity-30 cursor-pointer"
                      title="Move Banner Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-bold uppercase text-neutral-600 ml-2">
                      {banner.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdate(banner.id, 'enabled', !banner.enabled)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                        banner.enabled ? 'bg-emerald-500' : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          banner.enabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Left: Direct File Upload (Image + Optional Video) */}
                  <div className="md:col-span-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
                    <ImageUploader
                      label="Banner Image"
                      folder="banners"
                      images={banner.imageUrl ? [banner.imageUrl] : []}
                      onChange={(newUrls) => handleUpdate(banner.id, 'imageUrl', newUrls[0] || '')}
                      multiple={false}
                      maxFiles={1}
                      aspectRatio="wide"
                    />

                    {/* Optional Banner Video Upload */}
                    <div className="pt-3 border-t border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-neutral-700 flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          <span>Optional Banner Video</span>
                        </span>
                        <input
                          type="file"
                          accept="video/*"
                          ref={(el) => {
                            videoInputRefs.current[banner.id] = el;
                          }}
                          onChange={(e) => handleBannerVideoUpload(banner.id, e)}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRefs.current[banner.id]?.click()}
                          disabled={uploadingVideoId === banner.id}
                          className="px-2.5 py-1 bg-neutral-900 text-white text-[10px] font-bold uppercase rounded flex items-center gap-1 cursor-pointer"
                        >
                          {uploadingVideoId === banner.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3 text-[#FFCD00]" />
                          )}
                          <span>{banner.videoUrl ? 'Replace Video' : '+ Upload Video'}</span>
                        </button>
                      </div>

                      {banner.videoUrl && (
                        <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-neutral-200">
                          <ResolvedVideoPlayer
                            videoUrl={banner.videoUrl}
                            className="w-32 h-18 object-cover rounded bg-black"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdate(banner.id, 'videoUrl', '')}
                            className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                          >
                            Remove Video
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Content fields */}
                  <div className="md:col-span-7 space-y-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Title / Heading
                      </label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => handleUpdate(banner.id, 'title', e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                        Subtitle / Description
                      </label>
                      <textarea
                        value={banner.subtitle || ''}
                        onChange={(e) => handleUpdate(banner.id, 'subtitle', e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={banner.buttonText || ''}
                          onChange={(e) => handleUpdate(banner.id, 'buttonText', e.target.value)}
                          placeholder="e.g. Buy Now"
                          className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={banner.buttonLink || '#catalog'}
                          onChange={(e) => handleUpdate(banner.id, 'buttonLink', e.target.value)}
                          placeholder="#catalog"
                          className="w-full text-xs font-mono p-2 bg-neutral-50 border border-neutral-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 block mb-1">
                          Display Location
                        </label>
                        <select
                          value={banner.displayLocation}
                          onChange={(e) =>
                            handleUpdate(banner.id, 'displayLocation', e.target.value as any)
                          }
                          className="w-full text-xs p-2 bg-neutral-50 border border-neutral-300 rounded-lg"
                        >
                          <option value="product_promo">Product Page Promotional Banner</option>
                          <option value="hero">Homepage Hero Banner</option>
                          <option value="popup">Top Announcement Banner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  {confirmDeleteId === banner.id ? (
                    <button
                      type="button"
                      onClick={async () => {
                        await onDeleteBanner(banner.id);
                        setEditingBanners((prev) => prev.filter((b) => b.id !== banner.id));
                        setConfirmDeleteId(null);
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-black uppercase rounded-lg cursor-pointer"
                    >
                      Confirm Delete Banner
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(banner.id)}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Banner</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSave(banner)}
                    className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSaved ? 'bg-emerald-500 text-white' : 'bg-neutral-950 text-white'
                    }`}
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Published!' : 'Save Banner'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

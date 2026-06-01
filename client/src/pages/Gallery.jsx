import PhotoUploader from '../components/PhotoUploader'

export default function Gallery() {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Photos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Free-form photo library — drop in anything: cable bundles, label closeups, before/after shots.</p>
      </div>
      <div className="bg-[#141414] border border-[#1f2937] rounded-lg p-4">
        <PhotoUploader entityType="gallery" title="Gallery"/>
      </div>
      <p className="text-xs text-gray-600 mt-4">
        Tip: photos tied to a specific device, rack, or cable run live on those pages. This is for everything else.
      </p>
    </div>
  )
}

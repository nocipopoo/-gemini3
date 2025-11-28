import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface Props {
  label: string;
  image: File | null;
  onChange: (file: File | null) => void;
  description?: string;
}

export const ImageUpload: React.FC<Props> = ({ label, image, onChange, description }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onChange(file);
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering upload click
    onChange(null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
      <div
        className={`relative group border-2 border-dashed rounded-xl p-4 transition-all duration-300 h-40 flex flex-col items-center justify-center cursor-pointer
          ${image ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`upload-${label}`)?.click()}
      >
        {image ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-lg">
             {/* Preview */}
             <img 
               src={URL.createObjectURL(image)} 
               alt="Preview" 
               className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
             />
             <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-white font-medium text-sm drop-shadow-md">更换图片</span>
             </div>
             <button
              onClick={removeImage}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform transform hover:scale-110"
              title="移除"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Upload size={24} className="text-blue-500" />
            </div>
            <p className="text-sm text-slate-600 font-medium">点击或拖拽上传</p>
            {description && <p className="text-xs text-slate-400 mt-1 text-center">{description}</p>}
          </>
        )}
        <input
          id={`upload-${label}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

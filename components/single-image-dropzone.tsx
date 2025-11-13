"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import * as React from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { formatFileSize } from "@/components/upload/uploader-provider";

import { Spinner } from "./spinner";

const DROPZONE_VARIANTS = {
  base: "relative rounded-md p-4 flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border-2 border-dashed border-gray-400 dark:border-gray-600 transition-colors duration-200 ease-in-out",
  image:
    "border-0 p-0 min-h-0 min-w-0 relative bg-gray-100 dark:bg-gray-800 shadow-md",
  active: "border-blue-500 dark:border-blue-400",
  disabled:
    "bg-gray-100/50 dark:bg-gray-800/50 border-gray-400/50 dark:border-gray-600/50 cursor-default pointer-events-none",
  accept:
    "border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-900/30",
  reject: "border-red-500 dark:border-red-400 bg-red-100 dark:bg-red-900/30",
};

/**
 * Props for the SingleImageDropzone component.
 *
 * @interface SingleImageDropzoneProps
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 */
export interface SingleImageDropzoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "value"
  > {
  /**
   * The width of the dropzone area in pixels.
   */
  width?: number;

  /**
   * The height of the dropzone area in pixels.
   */
  height?: number;

  /**
   * Whether the dropzone is disabled.
   */
  disabled?: boolean;

  /**
   * Currently selected file or URL.
   */
  value?: File | string;

  /**
   * Invoked when a file is selected or cleared.
   */
  onChange?: (file?: File) => void | Promise<void>;

  /**
   * Options passed to the underlying react-dropzone component.
   * Cannot include 'disabled', 'onDrop', 'maxFiles', or 'multiple' as they are handled internally.
   */
  dropzoneOptions?: Omit<
    DropzoneOptions,
    "disabled" | "onDrop" | "maxFiles" | "multiple"
  >;
}

/**
 * A single image upload component with preview and upload status.
 *
 * This component allows users to upload a single image, shows a preview,
 * and provides controls to remove the image.
 */
const SingleImageDropzone = React.forwardRef<
  HTMLInputElement,
  SingleImageDropzoneProps
>(
  (
    {
      dropzoneOptions,
      width = 320,
      height = 200,
      className,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [error, setError] = React.useState<string>();
    const [localFile, setLocalFile] = React.useState<File>();
    const [objectUrl, setObjectUrl] = React.useState<string>();
    const maxSize = dropzoneOptions?.maxSize;

    const file = value ?? localFile;

    React.useEffect(() => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        setObjectUrl(url);
        return () => URL.revokeObjectURL(url);
      }
      setObjectUrl(typeof file === "string" ? file : undefined);
      return undefined;
    }, [file]);

    const handleSelect = React.useCallback(
      (selected?: File) => {
        setLocalFile(selected);
        setError(undefined);
        if (onChange) {
          void onChange(selected);
        }
      },
      [onChange]
    );

    const displayUrl = objectUrl;
    const isDisabled = !!disabled;

    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
      useDropzone({
        accept: { "image/*": [] }, // Accept only image files
        multiple: false,
        disabled: isDisabled,
        onDrop: (acceptedFiles, rejectedFiles) => {
          setError(undefined);

          // Handle rejections first
          if (rejectedFiles.length > 0) {
            if (rejectedFiles[0]?.errors[0]) {
              const error = rejectedFiles[0].errors[0];
              const code = error.code;

              // User-friendly error messages
              const messages: Record<string, string> = {
                "file-too-large": `The file is too large. Max size is ${formatFileSize(
                  maxSize ?? 0
                )}.`,
                "file-invalid-type": "Invalid file type.",
                "too-many-files": "You can only upload one file.",
                default: "The file is not supported.",
              };

              setError(messages[code] ?? messages.default);
            }
            return; // Exit early if there are any rejections
          }

          // Handle accepted files only if there are no rejections
          if (acceptedFiles.length > 0) {
            handleSelect(acceptedFiles[0]);
          }
        },
        ...dropzoneOptions,
      });

    const dropZoneClassName = React.useMemo(
      () =>
        cn(
          DROPZONE_VARIANTS.base,
          isFocused && DROPZONE_VARIANTS.active,
          isDisabled && DROPZONE_VARIANTS.disabled,
          displayUrl && DROPZONE_VARIANTS.image,
          isDragReject && DROPZONE_VARIANTS.reject,
          isDragAccept && DROPZONE_VARIANTS.accept,
          className
        ),
      [isFocused, isDisabled, displayUrl, isDragAccept, isDragReject, className]
    );

    return (
      <div className="relative flex flex-col items-center">
        {disabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
            <Spinner size="lg" />
          </div>
        )}
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height,
            },
          })}
        >
          <input ref={ref} {...getInputProps()} {...props} />

          {displayUrl ? (
            <div className="relative h-full w-full">
              <Image
                fill
                unoptimized
                className="rounded-md object-cover"
                src={displayUrl}
                alt={file instanceof File ? file.name : "uploaded image"}
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          ) : (
            // Placeholder content shown when no image is selected
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400",
                isDisabled && "opacity-50"
              )}
            >
              <UploadCloudIcon className="mb-1 h-7 w-7" />
              <div className="font-medium">
                drag & drop an image or click to select
              </div>
              {maxSize && (
                <div className="text-xs">
                  Max size: {formatFileSize(maxSize)}
                </div>
              )}
            </div>
          )}

          {/* Remove button */}
          {displayUrl && !disabled && (
            <button
              type="button"
              className="group pointer-events-auto absolute right-1 top-1 z-10 transform rounded-full border border-gray-400 bg-white p-1 shadow-md transition-all hover:scale-110 dark:border-gray-600 dark:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering dropzone click
                handleSelect(undefined);
              }}
            >
              <XIcon className="block h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        {/* Error message display */}
        {error && (
          <div className="mt-2 flex items-center text-xs text-red-500 dark:text-red-400">
            <AlertCircleIcon className="mr-1 h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);
SingleImageDropzone.displayName = "SingleImageDropzone";

export { SingleImageDropzone };

"use client";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import {
  BlockNoteSchema,
  defaultBlockSpecs,
  type PartialBlock,
} from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import debounce from "lodash.debounce";
import { useMemo, useEffect, useCallback, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useEdgeStore } from "@/lib/edgestore";

const sanitizeBlocks = (blocks: PartialBlock[]): PartialBlock[] => {
  return blocks.map((block) => {
    const children = block.children
      ? sanitizeBlocks(block.children)
      : undefined;

    if (block.type === "image" || block.type === "video") {
      const { previewWidth, ...restProps } = block.props ?? {};
      const nextProps =
        previewWidth === null || previewWidth === undefined
          ? Object.keys(restProps).length
            ? restProps
            : undefined
          : { ...(block.props ?? {}), previewWidth };

      return {
        ...block,
        props: nextProps,
        children,
      };
    }

    return {
      ...block,
      children,
    };
  });
};

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string;
  editable?: boolean;
}

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
  const { resolvedTheme } = useTheme();
  const { edgestore } = useEdgeStore();

  const schema = useMemo(() => {
    const withPreviewWidthDefault = <T extends "image" | "video">(key: T) => {
      const spec = defaultBlockSpecs[key];
      return {
        ...spec,
        config: {
          ...spec.config,
          propSchema: {
            ...spec.config.propSchema,
            previewWidth: spec.config.propSchema.previewWidth
              ? {
                  ...spec.config.propSchema.previewWidth,
                  default: 0,
                }
              : spec.config.propSchema.previewWidth,
          },
        },
      };
    };

    return BlockNoteSchema.create({
      blockSpecs: {
        ...defaultBlockSpecs,
        image: withPreviewWidthDefault("image"),
        video: withPreviewWidthDefault("video"),
      },
    });
  }, []);

  const handleUpload = useCallback(
    async (file: File) => {
      const response = await edgestore.publicFiles.upload({
        file,
      });
      return response.url;
    },
    [edgestore]
  );

  const uploadFileRef = useRef(handleUpload);
  useEffect(() => {
    uploadFileRef.current = handleUpload;
  }, [handleUpload]);

  const stableUploadFile = useCallback(
    (file: File) => uploadFileRef.current(file),
    []
  );

  const [initialBlocks] = useState<PartialBlock[] | undefined>(() => {
    if (!initialContent) return undefined;
    try {
      return sanitizeBlocks(JSON.parse(initialContent) as PartialBlock[]);
    } catch (err) {
      console.warn("Failed to parse editor content", err);
      return undefined;
    }
  });

  const debouncedChange = useMemo(
    () =>
      debounce((blocks: PartialBlock[]) => {
        onChange(JSON.stringify(sanitizeBlocks(blocks)));
      }, 500),
    [onChange]
  );

  useEffect(() => debouncedChange.cancel, [debouncedChange]);

  const editor = useCreateBlockNote(
    {
      initialContent: initialBlocks,
      uploadFile: stableUploadFile,
      schema,
    },
    [schema]
  );

  return (
    <div className="border rounded-lg p-2 bg-background">
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        onChange={(instance) => debouncedChange(instance.topLevelBlocks)}
      />
    </div>
  );
};

export default Editor;

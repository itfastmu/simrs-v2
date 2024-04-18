import * as React from "react";
import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

const DEFAULT_BUFFER = 12;

export type Marker = {
  id?: number;
  posisi: {
    y: number;
    x: number;
  };
  catatan?: string;
};
export type MarkerComponentProps = {
  posisi: {
    x: number;
    y: number;
  };
  // top: number;
  // left: number;
  itemNumber: number;
};
type Props = {
  src: StaticImageData;
  markers: Array<Marker> | undefined;
  onAddMarker?: (marker: Marker) => void;
  markerComponent?: React.FC<MarkerComponentProps>;
  bufferLeft?: number;
  bufferTop?: number;
  alt?: string;
  className?: string;
};

const ImageMarker: React.FC<Props> = ({
  src,
  markers,
  onAddMarker,
  markerComponent: MarkerComponent,
  bufferLeft = DEFAULT_BUFFER,
  bufferTop = DEFAULT_BUFFER,
  alt = "Markers",
  className,
}: Props) => {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const handleImageClick = (event: React.MouseEvent) => {
    if (!imageRef.current || !onAddMarker) {
      return;
    }
    const imageDimentions = imageRef.current.getBoundingClientRect();

    const [top, left] = calculateMarkerPosition(
      event,
      imageDimentions,
      window.scrollY,
      bufferLeft,
      bufferTop
    );

    onAddMarker({
      posisi: {
        x: left,
        y: top,
      },
    });
  };

  const getItemPosition = (marker: Marker) => {
    return {
      top: `${marker.posisi.y}%`,
      left: `${marker.posisi.x}%`,
    };
  };

  return (
    <div className="relative mx-auto my-0">
      <Image
        alt={alt}
        src={src?.src}
        blurDataURL={src?.blurDataURL}
        height={src?.height}
        width={src?.width}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        onClick={handleImageClick}
        className={cn("mx-auto my-0 w-full", className)}
        ref={imageRef}
        priority
      />
      {markers?.map((marker, itemNumber) => (
        <div
          className={cn(
            "absolute",
            !MarkerComponent &&
              "h-6 w-6 rounded-full bg-sky-600 text-center text-white"
          )}
          style={getItemPosition(marker)}
          key={itemNumber}
          data-testid="marker"
        >
          {MarkerComponent ? (
            <MarkerComponent {...marker} itemNumber={itemNumber} />
          ) : (
            itemNumber + 1
          )}
        </div>
      ))}
    </div>
  );
};

export type ImagePosition = {
  top: number;
  left: number;
  width: number;
  height: number;
};
export type MousePosition = {
  clientX: number;
  pageY: number;
};

const calculateMarkerPosition = (
  mousePosition: MousePosition,
  imagePosition: ImagePosition,
  scrollY: number,
  bufferLeft: number,
  bufferTop: number
) => {
  const pixelsLeft = mousePosition.clientX - imagePosition.left;
  let pixelsTop;
  if (imagePosition.top < 0) {
    pixelsTop = mousePosition.pageY - scrollY + imagePosition.top * -1;
  } else {
    pixelsTop = mousePosition.pageY - scrollY - imagePosition.top;
  }
  const top = ((pixelsTop - bufferTop) * 100) / imagePosition.height;
  const left = ((pixelsLeft - bufferLeft) * 100) / imagePosition.width;
  return [top, left];
};

export default ImageMarker;

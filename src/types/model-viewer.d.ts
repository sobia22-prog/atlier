import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          poster?: string;
          loading?: "auto" | "lazy" | "eager";
          reveal?: "auto" | "interaction" | "manual";
          "camera-controls"?: boolean;
          "touch-action"?: string;
          "auto-rotate"?: boolean;
          "auto-rotate-delay"?: number | string;
          "rotation-per-second"?: string;
          "camera-orbit"?: string;
          "camera-target"?: string;
          "field-of-view"?: string;
          "min-camera-orbit"?: string;
          "max-camera-orbit"?: string;
          "min-field-of-view"?: string;
          "max-field-of-view"?: string;
          "shadow-intensity"?: number | string;
          "shadow-softness"?: number | string;
          exposure?: number | string;
          "environment-image"?: string;
          "skybox-image"?: string;
          "stage-light"?: boolean;
          ar?: boolean;
          "ar-modes"?: string;
          "ar-scale"?: string;
          tabindex?: number | string;
        },
        HTMLElement
      >;
    }
  }
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "model-viewer": any;
      }
    }
  }
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

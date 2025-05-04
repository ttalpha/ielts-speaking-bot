import * as React from "react";
import { Text as RNText } from "react-native";
import * as Slot from "@/components/primitives/slot";
import type {
  SlottableTextProps,
  TextRef,
} from "@/components/primitives/types";
import { cn } from "@/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

const Text = React.forwardRef<TextRef, SlottableTextProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const textClass = React.useContext(TextClassContext);
    const Component = asChild ? Slot.Text : RNText;

    const classNameFont = React.useMemo(() => {
      if (!className) return "Geist";
      const classes = className.split(/\s+/);
      const fontWeightClass = classes.find((c) =>
        c.match(/font-(regular|medium|semibold|bold|extrabold)/)
      );
      if (!fontWeightClass) return "Geist";
      const fontWeight = fontWeightClass.split("-")[1];
      let weight = "Geist";
      if (fontWeight === "medium") weight += "-Medium";
      if (fontWeight === "semibold") weight += "-SemiBold";
      if (fontWeight === "bold") weight += "-Bold";
      if (fontWeight === "extrabold") weight += "-ExtraBold";
      return weight;
    }, [className]);

    return (
      <Component
        className={cn(
          "text-base text-foreground web:select-text",
          textClass,
          className
        )}
        style={{ fontFamily: classNameFont }}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Text, TextClassContext };

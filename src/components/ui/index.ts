/**
 * ============================================================================
 * THE UI PRIMITIVE LIBRARY  —  RESKIN SURFACE #2  (tailwind.config.js is #1)
 * ============================================================================
 *
 * Screens compose ONLY from these for anything visual. They may still use
 * layout utilities directly (flex, gap-4, px-2, w-full) — but never a colour,
 * a font size, or a radius.
 *
 * A designer reskinning the app touches two places:
 *      tailwind.config.js     the tokens
 *      src/components/ui/     how the tokens are assembled into components
 *
 * Nothing under src/screens, src/api, src/navigation or src/hooks should need
 * to change. `npm run lint:tokens` fails the build if that stops being true.
 *
 * A few components hold literal hex values for React Native props that cannot
 * take a className (ActivityIndicator color, Ionicons color,
 * placeholderTextColor). They are marked at each site and must be kept in sync
 * with the tokens — the one unavoidable duplication in this design.
 * ============================================================================
 */

export { Badge, type BadgeProps, type NadaBadge } from "./Badge";
export { Button, type ButtonProps, type UkuranTombol, type VarianTombol } from "./Button";
export { Card, type CardProps } from "./Card";
export {
  ConditionBadge,
  SeverityBadge,
  UrgencyBadge,
  VerificationBadge,
} from "./ConditionBadge";
export { Divider, KeyValue, SectionHeader, Stack, StatTile } from "./Layout";
export { ListItem, type ListItemProps } from "./ListItem";
export { Screen, type ScreenProps } from "./Screen";
export { MultiSelect, Select, type OpsiPilihan } from "./Select";
export { EmptyState, ErrorState, LoadingSpinner, QueryState } from "./States";
export { Text, type NadaTeks, type TextProps, type VarianTeks } from "./Text";
export { TextField, type TextFieldProps } from "./TextField";
export { temaNavigasi, WARNA } from "./tokens";

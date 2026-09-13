import type { SiteArea } from "../../types/site";
import {
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
} from "./docs-utils";

export type AreaDirectoryModel =
  | {
      kind: "projects";
      projects: ReturnType<typeof docsByProjectDirectory>;
    }
  | {
      kind: "directories";
      groups: ReturnType<typeof docsByDirectory>;
    };

export function buildAreaDirectoryModel(area: SiteArea): AreaDirectoryModel {
  if (isProjectArea(area)) {
    return {
      kind: "projects",
      projects: docsByProjectDirectory(area.docs),
    };
  }

  return {
    kind: "directories",
    groups: docsByDirectory(area.docs),
  };
}

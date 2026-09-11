from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"expected exactly one {label}, found {count}")
    return text.replace(old, new, 1)


app_path = ROOT / "src/App.tsx"
app = app_path.read_text(encoding="utf-8")
app = replace_once(
    app,
    'import { allDocs, compareDocs } from "./content/mira-docs-adapter";\n',
    'import { allDocs } from "./content/mira-docs-adapter";\nimport { buildDocumentContext } from "./content/document-context";\n',
    "App document-context import",
)
app = replace_once(
    app,
    '''import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectIdFromPath,
} from "./features/docs/docs-utils";
''',
    '''import { buildAreaDirectoryModel } from "./features/docs/area-directory-model";
import { directoryTitle } from "./features/docs/docs-utils";
''',
    "App docs imports",
)
app = replace_once(
    app,
    'import { weeklyIssueNumber } from "./features/weekly/weekly-utils";\n',
    '',
    "App weekly helper import",
)
app = replace_once(
    app,
    '''  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
''',
    '''  const directoryModel = buildAreaDirectoryModel(area);
  if (directoryModel.kind === "projects") {
    const projects = directoryModel.projects;
''',
    "AreaPage project model",
)
app = replace_once(
    app,
    '  const directoryGroups = docsByDirectory(area.docs);\n',
    '  const directoryGroups = directoryModel.groups;\n',
    "AreaPage directory model",
)
app = replace_once(
    app,
    '''  const projectId = projectIdFromPath(doc.path);
  const scopedArticleDocs = allDocs
    .filter(
      (item) =>
        item.root === doc.root &&
        (!projectId || projectIdFromPath(item.path) === projectId),
    )
    .sort(compareDocs);
  const index = scopedArticleDocs.findIndex((item) => item.path === doc.path);
  const previous = index > 0 ? scopedArticleDocs[index - 1] : undefined;
  const next = index >= 0 ? scopedArticleDocs[index + 1] : undefined;
''',
    '''  const { previous, next } = buildDocumentContext(doc, allDocs);
''',
    "DocPage standard context",
)
app = replace_once(
    app,
    '''  if (doc.root === "weekly") {
    const weeklyDocs = allDocs
      .filter((item) => item.root === "weekly")
      .sort((left, right) => weeklyIssueNumber(left) - weeklyIssueNumber(right));
    const weeklyIndex = weeklyDocs.findIndex((item) => item.path === doc.path);
    const weeklyPrevious = weeklyIndex > 0 ? weeklyDocs[weeklyIndex - 1] : undefined;
    const weeklyNext =
      weeklyIndex >= 0 && weeklyIndex < weeklyDocs.length - 1
        ? weeklyDocs[weeklyIndex + 1]
        : undefined;
    return (
      <WeeklyIssuePage
        doc={doc}
        html={html}
        previous={weeklyPrevious}
        next={weeklyNext}
      />
    );
  }
''',
    '''  if (doc.root === "weekly") {
    return (
      <WeeklyIssuePage
        doc={doc}
        html={html}
        previous={previous}
        next={next}
      />
    );
  }
''',
    "DocPage weekly context",
)
app_path.write_text(app, encoding="utf-8")


docs_path = ROOT / "src/features/docs/DocsLayout.tsx"
docs = docs_path.read_text(encoding="utf-8")
docs = replace_once(
    docs,
    '''import {
  directoryTitle,
  docsByDirectory,
  docsByProjectDirectory,
  isProjectArea,
  projectNavTitle,
} from "./docs-utils";
''',
    '''import { buildAreaDirectoryModel } from "./area-directory-model";
import { directoryTitle, projectNavTitle } from "./docs-utils";
''',
    "DocsLayout directory imports",
)
docs = replace_once(
    docs,
    '''function AreaDocNav({ area, current }: { area: SiteArea; current: string }) {
  if (isProjectArea(area)) {
    const projects = docsByProjectDirectory(area.docs);
''',
    '''function AreaDocNav({ area, current }: { area: SiteArea; current: string }) {
  const directoryModel = buildAreaDirectoryModel(area);
  if (directoryModel.kind === "projects") {
    const projects = directoryModel.projects;
''',
    "AreaDocNav project model",
)
docs = replace_once(
    docs,
    '  const groups = docsByDirectory(area.docs);\n',
    '  const groups = directoryModel.groups;\n',
    "AreaDocNav directory model",
)
docs_path.write_text(docs, encoding="utf-8")

print("document context and area directory model wired")

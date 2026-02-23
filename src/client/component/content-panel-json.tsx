import { JsonPreview } from "./json-prerview";

type ContentPanelJsonProps = {
	data: unknown;
};

export function ContentPanelJson({ data }: ContentPanelJsonProps) {
	return <JsonPreview data={data} />;
}

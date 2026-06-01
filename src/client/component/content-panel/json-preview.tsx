import { JsonPreview as JsonPreviewInternal } from "../json-prerview";

type JsonPreviewProps = {
	data: unknown;
	line: string;
};

export function JsonPreview({ data, line }: JsonPreviewProps) {
	return <JsonPreviewInternal data={data} line={line} />;
}

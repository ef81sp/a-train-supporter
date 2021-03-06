import { stationId } from "@/types";

export interface DiagramData {
  time: string;
  stationId: stationId;
  name?: string;
  borderColor?: string;
}

export interface chartJsDataSet {
  id: number; // 列車IDが入る
  label: string; // 列車名が入る
  data: DiagramData[];
  borderColor: string | Array<string>;
  borderWidth?: number;
}

export interface chartJsData {
  labels: string[]; // 駅名の一覧が入る
  datasets: chartJsDataSet[];
}

export type offsetDirectionCode = "forward" | "back";

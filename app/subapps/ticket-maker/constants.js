import * as FileSystem from "expo-file-system";

export const TICKET_FOLDER = FileSystem.documentDirectory + 'tickets/';

const DEFAULT_DATE_STRING = new Date().toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
});
export const DEFAULT_SEAT_NAMES = "1,2,3";
export const DEFAULT_EVENT_NAME = "Golden State Warriors vs. Orlando Magic";
export const DEFAULT_LOCATION_FIELD_NAME = "Chase Center";
export const DEFAULT_SECTION_NAME = "103";
export const DEFAULT_ROW_NAME = "10";
export const DEFAULT_TIME_OF_EVENT = "7:00 PM";
export const DEFAULT_FILE_NAME = `${DEFAULT_DATE_STRING}__${DEFAULT_SECTION_NAME}-${DEFAULT_ROW_NAME}-Seat${DEFAULT_SEAT_NAMES.replaceAll(',', '_' )}`;

export type Field = {
  label: string;
  key: string;
  required?: boolean;
  example?: string;
  default?: string;
};

export const COMMON_FIELDS: Field[] = [
  { label: 'Location Field Name*', key: 'locationFieldName', required: true, example: "Chase Center", default: DEFAULT_LOCATION_FIELD_NAME },
  { label: 'Event Name*', key: 'eventName', required: true, example: "Golden State Warriors vs. Orlando Magic", default: DEFAULT_EVENT_NAME },
  { label: 'Section Name*', key: 'sectionName', required: true, default: DEFAULT_SECTION_NAME },
  { label: 'Row Name*', key: 'rowName', required: true, default: DEFAULT_ROW_NAME },
  { label: 'Seat Names* (separated by commas)', key: 'seatNames', required: true, example: "1,2,3", default: DEFAULT_SEAT_NAMES },
  { label: 'Date of Event*', key: 'dateOfEvent', required: true, example: "Feb 3, 2025",  default:DEFAULT_DATE_STRING },
  { label: 'Time of Event*', key: 'timeOfEvent', required: true, example: "7:00 PM", default: DEFAULT_TIME_OF_EVENT },
  { label: 'File Name*', key: 'fileName', required: true, default: DEFAULT_FILE_NAME },
];
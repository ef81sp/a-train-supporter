// eslint-disable-next-line
export const jsonStringify = (value: any): string => {
  return JSON.stringify(value, (k, value) => {
    if (value instanceof Map) {
      return {
        dataType: "Map",
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    }
    return value;
  });
};

// eslint-disable-next-line
export const jsonParse = (value: string): any => {
  return JSON.parse(value, (k, value) => {
    if (typeof value === "object" && value !== null) {
      if (value.dataType === "Map") {
        return new Map(value.value);
      }
    }
    return value;
  });
};

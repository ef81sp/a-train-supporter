export const jsonStringify = (value: any) => {
  return JSON.stringify(value, (k, value) => {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()), // or with spread: value: [...value]
      };
    }
    return value;
  });
};

export const jsonParse = (value: any) => {
  return JSON.parse(value, (k, value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  });
};

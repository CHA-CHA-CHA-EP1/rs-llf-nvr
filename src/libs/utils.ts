export function generateIndex(data: any, parentIndex = '') {
 let index = 0;
 const result = data.map((item: any) => {
    // Create unique index based on parent index and current index
    const uniqueIndex = `${parentIndex}${index + 1}`;
    index++; // Increment index for the next item
    // Check if the item is a directory and has contents
    if (item.type === 'directory' && item.contents) {
      return {
        ...item,
        index: uniqueIndex, // Assign index to the directory
        contents: generateIndex(item.contents, uniqueIndex + '.') // Recursive call for contents
      };
    }

    // For files and other types, just return the item with index
    //

    return {
      ...item,
      index: uniqueIndex // Assign index to the file
    };
  });
  
  return result;
}

export function extractIndices(data: any[]): string[] {
  let indices: string[] = [];

  data.forEach((item) => {
    // Add the index of the current item to the array
    if (item.index) {
      indices.push(item.index);
    }

    // If the item has contents, recursively extract indices from contents
    if (item.contents) {
      indices = indices.concat(extractIndices(item.contents));
    }
  });

  return indices;
}


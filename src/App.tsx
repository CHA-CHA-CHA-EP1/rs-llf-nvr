import React, { useEffect, useState } from "react";
import './App.css';
import { invoke } from "@tauri-apps/api/core";

const flattenTree = (data: any[], parentIndex = '', openedDirs: { [key: string]: boolean }): any[] => {
  let result: any[] = [];

  data.forEach((item, index) => {
    const uniqueIndex = `${parentIndex}${index + 1}`;
    result.push({ ...item, uniqueIndex });
    if (item.type === "directory" && item.contents && openedDirs[uniqueIndex]) {
      result = result.concat(flattenTree(item.contents, uniqueIndex + ".", openedDirs));
    }
  });

  return result;
};

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [openedDirs, setOpenedDirs] = useState<{ [key: string]: boolean }>({});
  const [waitingForCommand, setWaitingForCommand] = useState<boolean>(false);
  const [isInputVisible, setIsInputVisible] = useState<boolean>(false);
  const [path, setPath] = useState<string>('');
  const [tree, setTree] = useState<any[]>([])
  
  // Generate the flattened tree considering only opened directories
  const flattenedTree = flattenTree(tree, '', openedDirs);

  const toggleDirectory = (uniqueIndex: string) => {
    setOpenedDirs((prev) => ({
      ...prev,
      [uniqueIndex]: !prev[uniqueIndex] // toggle directory open/close state
    }));
  };

  
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (["h", "j", "k", "l", "d", " ", "Escape", "e", "Enter", "p"].includes(event.key)) {
        event.preventDefault(); // Prevent default behavior
        if (event.key === "Escape") {
          setWaitingForCommand(false);
          setIsInputVisible(false);
        }

        if (event.key === " ") {
          setWaitingForCommand(true);
        }

        if (waitingForCommand) {
          if (event.key === "e") {
            setIsInputVisible(true);
          }

          if (event.key === "Enter") {
            setWaitingForCommand(false);
            setIsInputVisible(false);

            console.log('invoke path', path);

            let response = await invoke("greet", {
              name: path, 
            })

            console.log('resopnse->');
            // parse json
            console.log([JSON.parse(response as string)]);
            // setTree(JSON.parse(response as string).splice(0, 1));
            setTree([JSON.parse(response as string)]);

            setSelectedIndex(0);
          }
          return
        }

        if (event.key === "j") {
          // Move cursor down (if not at the end)
          setSelectedIndex((prev) =>
            prev < flattenedTree.length - 1 ? prev + 1 : prev
          );
        } else if (event.key === "k") {
          // Move cursor up (if not at the top)
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (event.key === "d") {
          // Toggle open/close directory when Spacebar is pressed
          const currentItem = flattenedTree[selectedIndex];
          if (currentItem.type === "directory") {
            toggleDirectory(currentItem.uniqueIndex);
          }
        } else if (event.key === "p") {
          const currentItem = flattenedTree[selectedIndex];
          const getFullpath = currentItem?.full_path;
          if (currentItem.type === "directory") {
            return;
          }

          await invoke("nvr_remote_open", {
            path: getFullpath,
          })
          console.log('haha', getFullpath);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [flattenedTree, selectedIndex]);

  const renderTree = (data: any[], parentIndex = '') => {
    return data.map((item, index) => {
      const uniqueIndex = `${parentIndex}${index + 1}`;
      const isOpen = openedDirs[uniqueIndex] || false;
      
      // Calculate the depth level based on the uniqueIndex
      const depthLevel = uniqueIndex.split('.').length - 1;
      const paddingLeft = depthLevel * 20; // Adjust this number for desired indentation
      
      if (index === 0) {
        let name = item.name.split('/');
        name = name[name.length - 1];
        item.name = name;
      }

      return (
        <div key={uniqueIndex}>
          {item.type === "directory" ? (
            <div
              style={{
                fontWeight: selectedIndex === flattenedTree.findIndex((i) => i.uniqueIndex === uniqueIndex) ? "bold" : "normal",
                color: selectedIndex === flattenedTree.findIndex((i) => i.uniqueIndex === uniqueIndex) ? "yellow" : "",
                marginLeft: `${paddingLeft}px`,
                cursor: "pointer",
              }}
            >
            { !isOpen ? "📁" : "📂" } {item.name}
              {/* Directory icon and open/close arrow */}
            </div>
          ) : (
            <div
              style={{
                fontWeight: selectedIndex === flattenedTree.findIndex((i) => i.uniqueIndex === uniqueIndex) ? "bold" : "normal",
                color: selectedIndex === flattenedTree.findIndex((i) => i.uniqueIndex === uniqueIndex) ? "yellow" : "",
                marginLeft: `${paddingLeft + 10}px`,
              }}
            >
              📄 {item.name}
              {/* File icon */}
            </div>
          )}
          {isOpen && item.contents && renderTree(item.contents, uniqueIndex + ".")}
        </div>
      );
    });
  };

  return (
    <div className="container">
      <div
        style={{
          textAlign: "left",
        }}
      >
        {isInputVisible && (
            <div style={{
              top: '50%',
              left: '50%',
              minWidth: '300px',
              transform: 'translate(-50%, -50%)',
              position: 'absolute',
              padding: '10px',
            }}>
              <label style={{fontWeight: 'bold'}}>Enter path:</label>
              <input 
                autoFocus
                placeholder="paste path here"
                onChange={(e) => setPath(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '16px',
                  padding: '5px',
                }}
              />
          </div>
        )}
        {renderTree(tree)}
      </div>
    </div>
  );
};

export default App;


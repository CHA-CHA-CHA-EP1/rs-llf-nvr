import "./App.css";
import React, { useEffect } from "react";
import { extractIndices, generateIndex } from "./libs/utils";

const tree = [
  {"type":"directory","name":"./","contents":[
    {"type":"file","name":"Cargo.lock"},
    {"type":"file","name":"Cargo.toml"},
    {"type":"directory","name":"src","contents":[
      {"type":"file","name":"main.rs"}
    ]},
    {"type":"directory","name":"src","contents":[
      {"type":"file","name":"oen.rs"},
      {"type":"file","name":"two.rs"},
      {"type":"directory","name":"src","contents":[
        {"type":"file","name":"oen.rs"},
        {"type":"file","name":"two.rs"}
      ]},
    ]},
  ]}
]

interface ItemProps {
  data: {
    type: string;
    index: string;
    name?: string;
    contents?: any,
    directories?: number,
    files?: number,
  }[],
  selectedIndex: string,
}

const Item: React.FC<ItemProps>= ({ data, selectedIndex }) => {
  const [openDirectories, setOpenDirectories] = React.useState<{ [key: string]: boolean }>({});

  const toggleDirectory = (uniqueIndex: string) => {
    setOpenDirectories((prev) => ({
      ...prev,
      [uniqueIndex]: !prev[uniqueIndex],
    }));
  }

  console.log(data);


  return (
    <div>
      {data.map((item) => {
        return (
          <div key={item?.index}
          >
            {item.type === "directory" && (
              <div 
                style={{ 
                  marginLeft: "1rem", 
                  cursor: 'pointer',
                }}
              >
                <span
                  onClick={() => {
                    toggleDirectory(item?.index);
                  }}
                  style={{
                    fontWeight: selectedIndex === item?.index ? "bold" : "normal",
                  }}
                >📁&nbsp;{item.name}</span>
                {openDirectories[item?.index] && item.contents && (
                  <Item data={item.contents} selectedIndex={selectedIndex} />
                )}
              </div>
            )}

            {item.type === "file" && (
              <div 
                style={{ 
                  marginLeft: "1rem",
                  fontWeight: selectedIndex === item?.index ? "bold" : "normal",
                }}
              >
                <span>📄</span>
                <span>&nbsp;{item.name}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}

function App() {
  const [print, setPrint] = React.useState<string>("");
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);
  const data = generateIndex(tree);
  const listOfIndex = extractIndices(data);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["h", "j", "k", "l"].includes(event.key)) {
        event.preventDefault(); // Prevent default browser behavior
        setPrint(event.key);

        // Navigation logic using HJKL keys
        if (event.key === "j") {
          // check if out of bound of listOfINdex
          setSelectedIndex((prev) => prev > listOfIndex.length - 1 ? listOfIndex.length - 1 : prev + 1);
        } else if (event.key === "k") {
          // check
          setSelectedIndex((prev) => prev > 0 ? prev - 1 : 0);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [])

  return (
    <div className="container">
      { print && <div className="print">{print}</div> }
      { selectedIndex && <div className="print">{listOfIndex[selectedIndex]}</div> }
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          id="greet-input"
          placeholder="/var/www/html"
        />
      </form>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          textAlign: "left",
          padding: "1rem",
        }}
      >
          <Item 
            data={generateIndex(tree)}
            selectedIndex={listOfIndex[selectedIndex]}
          />
      </div>
    </div>
  );
}

export default App;

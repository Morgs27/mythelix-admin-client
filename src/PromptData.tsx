import {
  Button,
  Container,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Wrap,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useRef, useState, ChangeEvent } from "react";
import serverUrl from "../server";

interface PromptVersion {
  _id: string;
  version: string;
  current: string;
  alterChance: string;
  extraString: string;
  promptWeights: string;
}

interface PromptType {
  prompt: string;
  probability: string;
  alters: PromptAlteration[];
}

interface PromptAlteration {
  value: string;
  probability: number;
  type: string;
}

interface PromptDataResponse {
  data: PromptVersion[];
}

const PromptData = () => {
  const [loadingData, setLoadingData] = useState(false);
  const [data, setData] = useState<PromptVersion[]>([]);

  const [currentWorkingVersion, setCurrentWorkingVersion] = useState("");
  const [currentWorkingType, setCurrentWorkingType] = useState("");

  const [isNewTypeModalOpen, setIsNewTypeModalOpen] = useState(false);
  const newTypeInput = useRef<HTMLInputElement>(null);

  const [isNewAlterationModalOpen, setIsNewAlterationModalOpen] =
    useState(false);
  const newAlterationInput = useRef<HTMLInputElement>(null);

  const getPromptData = async () => {
    setLoadingData(true);
    const result = await axios.get<PromptDataResponse>(
      `${serverUrl}/promptData`
    );
    const resultData: PromptVersion[] = result.data.data;

    resultData.sort((a, b) => {
      const [aFirst, aSecond] = a.version.split(".");
      const [bFirst, bSecond] = b.version.split(".");

      if (aFirst == bFirst) {
        return parseInt(bSecond) - parseInt(aSecond);
      } else {
        return parseInt(bFirst) - parseInt(aFirst);
      }
    });

    setData(resultData);

    setLoadingData(false);
  };

  useEffect(() => {
    if (!loadingData) {
      void getPromptData();
    }
  }, [loadingData]);

  const newVersion = async () => {
    console.log("newVersion");

    const mostRecentVersion = parseInt(data[0].version.split(".")[0]);
    const versionName = (mostRecentVersion + 1).toString() + ".0";

    await axios.get(
      `${serverUrl}/promptData/createVersion?versionName=${versionName}`
    );

    await getPromptData();
  };

  const deleteVersion = async (versionName: string) => {
    console.log("deleteVersion", versionName);

    await axios.get(
      `${serverUrl}/promptData/deleteVersion?version=${versionName}`
    );

    await getPromptData();
  };

  const updateVersion = async (versionName: string) => {
    const versionData = data.find((version: PromptVersion) => {
      return version.version == versionName;
    });

    await fetch(`${serverUrl}/promptData/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(versionData),
    });

    await getPromptData();
  };

  const saveChanges = async (versionName: string) => {
    const versionData = data.find((version: PromptVersion) => {
      return version.version == versionName;
    });

    const newVersionName =
      versionName.split(".")[0] +
      "." +
      (parseInt(versionName.split(".")[1]) + 1).toString();

    await fetch(
      `${serverUrl}/promptData/newVersion?versionName=${newVersionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(versionData),
      }
    );

    await getPromptData();
  };

  const newType = (versionName: string) => {
    setIsNewTypeModalOpen(true);
    console.log("New Type ", versionName);
    setCurrentWorkingVersion(versionName);
  };

  const addType = () => {
    setIsNewTypeModalOpen(false);

    const typeName: string = newTypeInput.current?.value || "";

    setData((data: PromptVersion[]) => {
      return data.map((version: PromptVersion) => {
        if (version.version == currentWorkingVersion) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];
          parsedTypes.push({
            prompt: typeName,
            probability: "0",
            alters: [],
          });
          return { ...version, promptWeights: JSON.stringify(parsedTypes) };
        } else {
          return version;
        }
      });
    });

    if (newTypeInput.current) {
      newTypeInput.current.value = "";
    }
  };

  const newAlteration = (typePrompt: string, version: string) => {
    console.log("addAlteraion", typePrompt, version);
    setCurrentWorkingType(typePrompt);
    setCurrentWorkingVersion(version);
    setIsNewAlterationModalOpen(true);
  };

  const addAlteration = () => {
    setIsNewAlterationModalOpen(false);

    const alterationName: string = newAlterationInput.current?.value || "";

    console.log(
      alterationName,
      currentWorkingType,
      currentWorkingVersion,
      "Add Alteration"
    );

    setData((data: PromptVersion[]) => {
      return data.map((version: PromptVersion) => {
        if (version.version == currentWorkingVersion) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];

          const newPromptWeights = parsedTypes.map((type: PromptType) => {
            if (type.prompt == currentWorkingType) {
              type.alters.push({
                value: alterationName,
                probability: 0,
                type: "before",
              });
            }
            return type;
          });

          return {
            ...version,
            promptWeights: JSON.stringify(newPromptWeights),
          };
        } else {
          return version;
        }
      });
    });

    if (newAlterationInput.current) {
      newAlterationInput.current.value = "";
    }
  };

  const deleteType = (typePrompt: string, versionSearch: string) => {
    setData((data: PromptVersion[]) => {
      return data.map((version: PromptVersion) => {
        if (version.version == versionSearch) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];
          const filtered = parsedTypes.filter((type: PromptType) => {
            return type.prompt != typePrompt;
          });
          return { ...version, promptWeights: JSON.stringify(filtered) };
        } else {
          return version;
        }
      });
    });
  };

  const deleteAlteration = (
    typePrompt: string,
    alterationName: string,
    versionSearch: string
  ) => {
    setData((data: PromptVersion[]) => {
      return data.map((version: PromptVersion) => {
        if (version.version == versionSearch) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];
          const filtered = parsedTypes.map((type: PromptType) => {
            if (type.prompt == typePrompt) {
              const newAlters = type.alters.filter(
                (alteration: PromptAlteration) => {
                  return alteration.value != alterationName;
                }
              );
              return { ...type, alters: newAlters };
            } else {
              return type;
            }
          });
          return { ...version, promptWeights: JSON.stringify(filtered) };
        } else {
          return version;
        }
      });
    });
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  const updateAlterChance = (
    e: ChangeEvent<HTMLInputElement>,
    versionSearch: string
  ) => {
    setData((prevData) =>
      prevData.map((version) =>
        version.version === versionSearch
          ? { ...version, alterChance: e.target.value }
          : version
      )
    );
  };

  const updateAfterText = (
    e: ChangeEvent<HTMLInputElement>,
    versionSearch: string
  ) => {
    setData((prevData) =>
      prevData.map((version) =>
        version.version === versionSearch
          ? { ...version, extraString: e.target.value }
          : version
      )
    );
  };

  const updateTypeProbability = (
    e: ChangeEvent<HTMLInputElement>,
    versionSearch: string,
    typeSearch: PromptType
  ) => {
    setData((prevData) =>
      prevData.map((version) => {
        if (version.version === versionSearch) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];
          const updatedTypes = parsedTypes.map((type: PromptType) =>
            type.prompt === typeSearch.prompt
              ? { ...type, probability: e.target.value }
              : type
          );
          return { ...version, promptWeights: JSON.stringify(updatedTypes) };
        }
        return version;
      })
    );
  };

  const updateTypeAlterationProbability = (
    e: ChangeEvent<HTMLInputElement>,
    versionSearch: string,
    typeSearch: PromptType,
    alteration: PromptAlteration
  ) => {
    setData((prevData) =>
      prevData.map((version) => {
        if (version.version === versionSearch) {
          const parsedTypes: PromptType[] = JSON.parse(
            version.promptWeights
          ) as PromptType[];
          const updatedTypes = parsedTypes.map((type: PromptType) => {
            if (type.prompt === typeSearch.prompt) {
              const updatedAlters = type.alters.map((alter) =>
                alter.value === alteration.value
                  ? { ...alter, probability: parseFloat(e.target.value) }
                  : alter
              );
              return { ...type, alters: updatedAlters };
            }
            return type;
          });
          return { ...version, promptWeights: JSON.stringify(updatedTypes) };
        }
        return version;
      })
    );
  };

  const changeActive = (newValue: string, versionSearch: string) => {
    console.log("change active", newValue, versionSearch);
    setData((prevData) =>
      prevData.map((version) =>
        version.version === versionSearch
          ? { ...version, current: newValue }
          : version
      )
    );
  };

  return (
    <Container maxWidth={"100%"}>
      <Modal
        isOpen={isNewTypeModalOpen}
        onClose={() => setIsNewTypeModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="name" ref={newTypeInput}></Input>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => setIsNewTypeModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                addType();
              }}
            >
              Add Type
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isNewAlterationModalOpen}
        onClose={() => setIsNewAlterationModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Alteration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input placeholder="name" ref={newAlterationInput}></Input>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => setIsNewAlterationModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                addAlteration();
              }}
            >
              Add Alteration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Tabs marginInline={"15px"} size={"lg"}>
        <TabList>
          <Wrap>
            {data.map((version: PromptVersion) => {
              return <Tab key={version._id}>{version.version}</Tab>;
            })}

            <Button
              onClick={() => {
                void newVersion();
              }}
              backgroundColor={"rgba(0,0,0,0.05)"}
              borderRadius={"5px"}
              margin={"3px"}
              marginLeft={"10px"}
            >
              New +{" "}
            </Button>
          </Wrap>
        </TabList>

        <TabPanels>
          {data.map((version: PromptVersion) => {
            const weights: PromptType[] = JSON.parse(
              version.promptWeights
            ) as PromptType[];
            return (
              <TabPanel key={version._id}>
                <Wrap>
                  <div style={{}}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Active
                    </Text>
                    {version.current == "true" ? (
                      <Switch
                        onChange={() => {
                          changeActive("false", version.version);
                        }}
                        margin={"5px"}
                        marginTop={"10px"}
                        isChecked
                      />
                    ) : (
                      <Switch
                        onChange={() => {
                          changeActive("true", version.version);
                        }}
                        margin={"5px"}
                        marginTop={"10px"}
                      />
                    )}
                  </div>

                  <div style={{ marginLeft: "30px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Alter Chance
                    </Text>

                    <Input
                      onChange={(e) => {
                        updateAlterChance(e, version.version);
                      }}
                      height={"40px"}
                      border={"1px solid rgba(0,0,0,0.4)"}
                      padding={"7.5px"}
                      width={"100px"}
                      placeholder={version.alterChance}
                    ></Input>
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Addon String
                    </Text>

                    <Input
                      onChange={(e) => {
                        updateAfterText(e, version.version);
                      }}
                      placeholder={version.extraString}
                      height={"40px"}
                      border={"1px solid rgba(0,0,0,0.4)"}
                      padding={"7.5px"}
                      width={"500px"}
                    />
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      New Type
                    </Text>
                    <Button
                      onClick={() => {
                        newType(version.version);
                      }}
                    >
                      Add +
                    </Button>
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Delete Version
                    </Text>
                    <Button
                      onClick={() => {
                        void deleteVersion(version.version);
                      }}
                      backgroundColor={"rgba(255,0,0,1)"}
                      color={"white"}
                    >
                      Delete {version.version}
                    </Button>
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Update Version
                    </Text>
                    <Button
                      onClick={() => void updateVersion(version.version)}
                      backgroundColor={"rgba(255,165,0,1)"}
                      color={"white"}
                    >
                      Update {version.version}
                    </Button>
                  </div>

                  <div style={{ marginLeft: "20px" }}>
                    <Text margin={"2px"} marginBottom={"5px"}>
                      Save Changes
                    </Text>
                    <Button
                      onClick={() => void saveChanges(version.version)}
                      backgroundColor={"rgba(0,150,0,1)"}
                      color={"white"}
                    >
                      Save{" "}
                      {version.version.split(".")[0] +
                        "." +
                        (
                          parseInt(version.version.split(".")[1]) + 1
                        ).toString()}
                    </Button>
                  </div>
                </Wrap>

                <Container
                  borderRadius={"5px"}
                  marginTop={"20px"}
                  padding={"10px"}
                  border={"1px solid rgba(0,0,0,0.1)"}
                  overflowY={"scroll"}
                  width={"100%"}
                  maxWidth={""}
                  height={`${window.innerHeight - 310}px`}
                >
                  {weights.map((type) => {
                    return (
                      <div key={type.prompt} style={{ marginBottom: "30px" }}>
                        <Wrap
                          style={{
                            padding: "5px",
                            width: "auto",
                            marginBottom: "10px",
                          }}
                        >
                          <Text
                            style={{
                              marginTop: "4px",
                              marginLeft: "5px",
                              width: "200px",
                              display: "block",
                              fontSize: "20px",
                              textTransform: "capitalize",
                            }}
                          >
                            {type.prompt}
                          </Text>
                          <Input
                            onChange={(e) => {
                              updateTypeProbability(e, version.version, type);
                            }}
                            width={"80px"}
                            textAlign={"center"}
                            type="text"
                            placeholder={type.probability}
                          />

                          <Button
                            onClick={() => {
                              newAlteration(type.prompt, version.version);
                            }}
                          >
                            Add +
                          </Button>
                          <Button
                            onClick={() => {
                              deleteType(type.prompt, version.version);
                            }}
                            backgroundColor={"rgba(255,0,0,1)"}
                            color={"white"}
                          >
                            Delete
                          </Button>
                        </Wrap>
                        <Divider marginBottom={"8px"}></Divider>
                        {type.alters.map((alter) => (
                          <Wrap
                            key={alter.value}
                            marginBottom="10px"
                            marginLeft="50px"
                          >
                            <Text
                              style={{
                                marginTop: "4px",
                                marginLeft: "5px",
                                width: "200px",
                                display: "block",
                                fontSize: "16px",
                                textTransform: "capitalize",
                              }}
                            >
                              {alter.value}
                            </Text>
                            <Input
                              onChange={(e) => {
                                updateTypeAlterationProbability(
                                  e,
                                  version.version,
                                  type,
                                  alter
                                );
                              }}
                              width={"80px"}
                              textAlign={"center"}
                              type="text"
                              placeholder={alter.probability.toString()}
                            />
                            <Button
                              onClick={() => {
                                deleteAlteration(
                                  type.prompt,
                                  alter.value,
                                  version.version
                                );
                              }}
                              backgroundColor={"rgba(255,0,0,1)"}
                              color={"white"}
                            >
                              Delete
                            </Button>
                          </Wrap>
                        ))}
                      </div>
                    );
                  })}
                </Container>
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default PromptData;

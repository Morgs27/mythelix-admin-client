import {
  Box,
  Button,
  Card,
  CardBody,
  Image,
  Text,
  Container,
  Divider,
  Input,
  Select,
  Skeleton,
  Spinner,
  Stack,
  Tag,
  Wrap,
} from "@chakra-ui/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import serverUrl from "./../server";

type imageStructure = {
  _id: string;
  type: string;
  alterations: string;
  prompt: string;
  photo: string;
  promptVersion: string;
  hiddenAlteration?: string;
  hiddenType?: string;
  hiddenSearch?: string;
};

type PromptData = {
  version: string;
};

const Images = () => {
  const [images, updateImages] = useState<imageStructure[]>([]);

  const [loadingImages, updateLoadingImages] = useState(false);
  const [loadingCreate, updateLoadingCreate] = useState(false);

  const [types, setTypes] = useState<string[]>([]);
  const [alterations, setAlterations] = useState<string[]>([]);

  const [version, setVersion] = useState("");
  const [allVersions, setAllVersions] = useState<PromptData[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [shownImages, setShownImages] = useState(0);

  const getVersions = async () => {
    setLoadingVersions(true);
    updateLoadingImages(true);

    console.log("Getting From Server " + `${serverUrl}/promptData`);

    const result = await axios.get<{ data: PromptData[] }>(
      `${serverUrl}/promptData`
    );
    const resultData = result.data.data;

    resultData.sort((a, b) => {
      const [aFirst, aSecond] = a.version.split(".");
      const [bFirst, bSecond] = b.version.split(".");

      if (aFirst === bFirst) {
        return parseInt(bSecond) - parseInt(aSecond);
      } else {
        return parseInt(bFirst) - parseInt(aFirst);
      }
    });

    setVersion(resultData[0].version);

    console.log(resultData[0].version);

    setAllVersions(resultData);

    setLoadingVersions(false);
  };

  const populateImages = useCallback(async () => {
    updateLoadingImages(true);
    const result = await axios.get<{ data: imageStructure[] }>(
      `${serverUrl}/getImages?version=${version}`
    );
    const data = result.data.data;
    updateImages(data);
    updateLoadingImages(false);
  }, [version]);

  useEffect(() => {
    const addedTypes = [] as string[];
    const addedAlterations = [] as string[];

    images.forEach((image: imageStructure) => {
      if (addedTypes.indexOf(image.type) == -1) {
        addedTypes.push(image.type);
      }
      if (addedAlterations.indexOf(image.alterations) == -1) {
        addedAlterations.push(image.alterations);
      }
    });

    setTypes(addedTypes);
    setAlterations(addedAlterations);

    setShownImages(
      images.filter((image: imageStructure) => {
        return (
          image.hiddenAlteration != "true" &&
          image.hiddenType != "true" &&
          image.hiddenSearch != "true"
        );
      }).length
    );
  }, [images]);

  const createImage = async () => {
    if (!loadingCreate) {
      updateLoadingCreate(true);
      await axios.get(`${serverUrl}/createImage`);
      updateLoadingCreate(false);
    }
  };

  const createMultipleImages = async (number: number) => {
    for (let index = 0; index < number; index++) {
      await createImage();
    }
    await populateImages();
  };

  const deleteImage = async (id: string) => {
    await axios.get(`${serverUrl}/deleteImage?id=${id}`);

    const image = document.getElementById(id);

    if (image) {
      image.style.display = "none";
    }
  };

  useEffect(() => {
    console.log("here");
    if (!loadingImages) {
      void populateImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingVersions, version]);

  useEffect(() => {
    setLoadingVersions(true);
    void getVersions();
  }, []);

  return (
    <Container width={"100%"} height={"100%"} maxWidth={""} textAlign={"left"}>
      <Wrap spacing="30px" direction={"row"} width={"100%"}>
        <Select
          onChange={(e) => {
            setVersion(e.target.value);
          }}
          width={"100px"}
        >
          {allVersions.map((version) => {
            return (
              <option key={version.version} value={version.version}>
                {version.version}
              </option>
            );
          })}
        </Select>

        <Input
          onChange={(e) => {
            const text = e.target.value;
            if (text.length < 1) {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  return { ...image, hiddenSearch: "false" };
                });
              });
            } else {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  if (
                    image.prompt.indexOf(text) > -1 ||
                    image.type.indexOf(text) > -1 ||
                    image.alterations.indexOf(text) > -1
                  ) {
                    return { ...image, hiddenSearch: "false" };
                  } else {
                    return { ...image, hiddenSearch: "true" };
                  }
                });
              });
            }
          }}
          placeholder="Search Images"
          width={"400px"}
        />

        <Select
          onChange={(e) => {
            const type = e.target.value;
            if (type.length < 1) {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  return { ...image, hiddenType: "false" };
                });
              });
            } else {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  if (image.type == type) {
                    return { ...image, hiddenType: "false" };
                  } else {
                    return { ...image, hiddenType: "true" };
                  }
                });
              });
            }
          }}
          placeholder="All Types"
          width={"200px"}
        >
          {types.map((type) => {
            return (
              <option key={type} value={type}>
                {type}
              </option>
            );
          })}
        </Select>

        <Select
          onChange={(e) => {
            const alteration = e.target.value;
            if (alteration.length < 1) {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  return { ...image, hiddenAlteration: "false" };
                });
              });
            } else {
              updateImages((images: imageStructure[]) => {
                return images.map((image: imageStructure) => {
                  if (image.alterations == alteration) {
                    return { ...image, hiddenAlteration: "false" };
                  } else {
                    return { ...image, hiddenAlteration: "true" };
                  }
                });
              });
            }
          }}
          placeholder="All Alterations"
          width={"200px"}
        >
          {alterations.map((alteration) => {
            if (alteration != "null") {
              return (
                <option key={alteration} value={alteration}>
                  {alteration}
                </option>
              );
            }
          })}
        </Select>

        <Button>{shownImages}</Button>

        <Button
          onClick={() => {
            void populateImages();
          }}
        >
          Refresh Images
        </Button>

        <>
          <Wrap marginRight={"0px"}>
            <Text
              background={"rgb(237,242,247)"}
              borderRadius={"5px"}
              padding={"8px"}
            >
              Create Images
            </Text>

            <Button
              onClick={() => {
                void createMultipleImages(1);
              }}
            >
              {loadingCreate ? <Spinner /> : "1"}
            </Button>

            <Button
              onClick={() => {
                void createMultipleImages(3);
              }}
            >
              {loadingCreate ? <Spinner /> : "3"}
            </Button>

            <Button
              onClick={() => {
                void createMultipleImages(5);
              }}
            >
              {loadingCreate ? <Spinner /> : "5"}
            </Button>

            <Button
              onClick={() => {
                void createMultipleImages(10);
              }}
            >
              {loadingCreate ? <Spinner /> : "10"}
            </Button>

            <Button
              onClick={() => {
                void createMultipleImages(100);
              }}
            >
              {loadingCreate ? <Spinner /> : "100"}
            </Button>

            <Button
              onClick={() => {
                void createMultipleImages(1000);
              }}
            >
              {loadingCreate ? <Spinner /> : "1000"}
            </Button>
          </Wrap>
        </>
      </Wrap>

      <Divider margin={"15px 0px"} />

      <Box
        display={"flex"}
        flexWrap={"wrap"}
        overflowY={"scroll"}
        width={"100%"}
        height={`${window.innerHeight - 170}px`}
      >
        {loadingImages ? (
          <Stack>
            <Skeleton height="100px" />
            <Skeleton height="100px" />
            <Skeleton height="100px" />
          </Stack>
        ) : (
          images.map((image) => {
            return (
              <Card
                display={
                  image.hiddenAlteration == "true" ||
                  image.hiddenType == "true" ||
                  image.hiddenSearch == "true"
                    ? "none"
                    : ""
                }
                id={image._id}
                margin={"10px"}
                width={"340px"}
                height={"480px"}
                flex={""}
                key={image._id}
              >
                <CardBody>
                  <Image
                    loading={"lazy"}
                    src={image.photo}
                    height={"300px"}
                  ></Image>
                  <Wrap marginTop={"10px"}>
                    <Tag size={"md"} variant="solid" colorScheme="teal">
                      {image.type}
                    </Tag>
                    {image.alterations == "null" ? null : (
                      <Tag size={"md"} variant="solid" colorScheme="teal">
                        {image.alterations}
                      </Tag>
                    )}
                  </Wrap>
                  <Text fontSize={"12px"} marginTop={"10px"}>
                    {image.prompt}
                  </Text>
                  <Text
                    fontSize={"11px"}
                    color={"rgba(0,0,0,0.6)"}
                    marginTop={"10px"}
                  >
                    {image.promptVersion}
                  </Text>
                  <Button
                    size={"sm"}
                    marginTop={"10px"}
                    color={"white"}
                    backgroundColor={"rgba(255,0,0,0.8)"}
                    onClick={() => {
                      void deleteImage(image._id);
                    }}
                  >
                    Delete
                  </Button>
                </CardBody>
              </Card>
            );
          })
        )}
      </Box>
    </Container>
  );
};

export default Images;

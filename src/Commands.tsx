import { Button, Container, Spinner, Wrap } from "@chakra-ui/react";
import axios from "axios";
import { useState, ReactNode } from "react";
import serverUrl from "../server";

interface PromptDataResponse {
  result: any;
}

const Commands = () => {
  const [content, setContent] = useState<ReactNode | null>(null);
  const [loading, setLoading] = useState(false);

  const testPrompts = async () => {
    setLoading(true);
    try {
      const result = await axios.get<PromptDataResponse>(
        `${serverUrl}/promptData/testPrompts`
      );
      setContent(
        <div>
          <pre>{JSON.stringify(result.data.result, null, 2)}</pre>
        </div>
      );
    } catch (error) {
      setContent(<div>Error: {(error as Error).message}</div>);
    }
    setLoading(false);
  };

  const createImage = async () => {
    if (!loading) {
      setLoading(true);
      await axios.get(`${serverUrl}/createImage`);
      setLoading(false);
    }
  };

  const createMultipleImages = async (number: number) => {
    for (let index = 0; index < number; index++) {
      await createImage();
    }
  };

  return (
    <>
      <Wrap>
        <Button onClick={() => void testPrompts()}> Test Prompts </Button>

        <Button onClick={() => void createImage()}> Create Image </Button>

        <Button onClick={() => void createMultipleImages(10)}>
          Create Multiple Images
        </Button>
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
        {loading ? <Spinner></Spinner> : content}
      </Container>
    </>
  );
};

export default Commands;

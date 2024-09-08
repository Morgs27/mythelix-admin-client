import {
  Container,
  Wrap,
  Image,
  Input,
  Button,
  Stack,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import serverUrl from "./../server";

const ImageGeneration = () => {
  const [image, updateImage] = useState<string | undefined>();
  const [prompt, updatePrompt] = useState<string | undefined>();
  const [loading, updateLoading] = useState(false);

  const generate = async (prompt: string | undefined) => {
    updateLoading(true);
    const result = await axios.get<string>(
      `${serverUrl}/generate?prompt=${prompt!}`
    );
    updateImage(result.data);
    updateLoading(false);
  };

  return (
    <Container textAlign={"left"} maxWidth={""}>
      <Wrap marginBottom={"20px"}>
        <Input
          value={prompt}
          onChange={(e) => updatePrompt(e.target.value)}
          width={"350px"}
        ></Input>
        <Button onClick={() => void generate(prompt)} colorScheme={"blue"}>
          Generate
        </Button>
      </Wrap>

      {loading ? (
        <Stack>
          <SkeletonCircle />
          <SkeletonText />
        </Stack>
      ) : image ? (
        <Image src={`data:image/png;base64,${image}`} boxShadow="lg" />
      ) : null}
    </Container>
  );
};

export default ImageGeneration;

import { OpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { HfInference } from "@huggingface/inference";
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();

const hfinterface = new HfInference("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");

export async function testing(filename: string) {
  const model = new OpenAI({
    modelName: "gpt-3.5-turbo-0125",
    temperature: 0.9,
    openAIApiKey: "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",
  });

  const loader = new PDFLoader(`./uploads/${filename}`, {
    splitPages: false,
  });

  const doc = await loader.load();

  const vectorStore = await MemoryVectorStore.fromDocuments(
    doc,
    new OpenAIEmbeddings({
      openAIApiKey: "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",
    })
  );
  const vectorStoreRetriever = vectorStore.asRetriever();
  const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);

  const labels = ["normas apa", "citas", "educación"];

  const result = await chain.call({
    query: `Clasifica el texto, 
    usa la estructura 
    {"labels": 
        [...los labels proporcionados], 
     "scores": 
        [... los puntajes segun los labels]}, 
        no omitas ninguna categoria, 
        siempre debe estar presente, recuerda que se debe
        ajustar a un modelo de clasificacion zeroshot, es decir
        la suma de los puntajes debe ser del 100%. 
        Las posibles categorías son: ${labels.join(
      ", "
    )}`,
  });

  //@ts-ignore
  return JSON.parse(result.text);
}

export async function withHG(filename: string) {
  const options = {};
  const pdf_text = await pdfExtract.extract(`./uploads/${filename}`, options);

  function extractAndJoinStrValues(arr: []) {
    const strValues = arr
      .map((item: any) => item.str)
      .filter((str) => str !== "");
    return strValues.join(" ");
  }

  let pdf = pdf_text.pages.map((page: any) => [...page.content]);

  const extractedValues = pdf.map((page: any, key: number) =>
    extractAndJoinStrValues(pdf[key])
  );

  const data = await hfinterface.zeroShotClassification({
    model: "MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7",
    inputs: `${extractedValues.join(" ")}`,
    parameters: {
      candidate_labels: ["normas apa", "citas", "educación"],
    },
  });
  return data;
}
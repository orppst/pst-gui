import {
  generateSchemaTypes,
  generateFetchers,
} from "@openapi-codegen/typescript";
import { defineConfig } from "@openapi-codegen/cli";
export default defineConfig({
  proposalTool: {
    from: {
      source: "url",
      url: "http://127.0.0.1:8084/pst/api/q/openapi",
    },
    outputDir: "src/generated",
    to: async (context) => {
      const filenamePrefix = "proposalTool";
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateFetchers(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});

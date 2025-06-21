import { sxzz } from "@sxzz/eslint-config";
import oxlint from 'eslint-plugin-oxlint';

export default sxzz({},
  {
  name: 'ignores/generated',
  ignores: ["data/**", "routeTree.gen.ts"],
  },
  ...oxlint.configs['flat/recommended']
);

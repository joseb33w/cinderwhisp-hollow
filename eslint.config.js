import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { document: 'readonly', window: 'readonly', navigator: 'readonly', requestAnimationFrame: 'readonly', innerWidth: 'readonly', innerHeight: 'readonly', devicePixelRatio: 'readonly', addEventListener: 'readonly', setTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', performance: 'readonly', FormData: 'readonly', HTMLFormElement: 'readonly', HTMLButtonElement: 'readonly', HTMLCanvasElement: 'readonly', CanvasRenderingContext2D: 'readonly', PointerEvent: 'readonly' } }
  }
);

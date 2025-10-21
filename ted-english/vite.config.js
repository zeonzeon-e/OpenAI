var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
var repository = (_a = process.env.GITHUB_REPOSITORY) !== null && _a !== void 0 ? _a : '';
var _b = repository.split('/'), _c = _b[0], owner = _c === void 0 ? '' : _c, _d = _b[1], repo = _d === void 0 ? '' : _d;
var normalizedOwner = owner.toLowerCase();
var normalizedRepo = repo.toLowerCase();
var isUserOrOrgSite = normalizedOwner.length > 0 && normalizedRepo === "".concat(normalizedOwner, ".github.io");
var basePath = !repo || isUserOrOrgSite ? '/' : "/".concat(repo, "/");
export default defineConfig({
    plugins: [react()],
    base: basePath,
    server: {
        port: 5173,
    },
});

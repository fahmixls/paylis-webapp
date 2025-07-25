import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("pages/home/index.tsx"),
  ...prefix("dashboard", [index("pages/dashboard/index.tsx")]),
  route("login", "pages/auth/login.tsx"),
  route("logout", "pages/auth/logout.tsx"),
  ...prefix("api/auth", [
    route("nonce", "api/auth/nonce.ts"),
    route("verify", "api/auth/verify.ts"),
    route("me", "api/auth/me.ts"),
    route("logout", "api/auth/logout.ts"),
  ]),
] satisfies RouteConfig;

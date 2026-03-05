import arcjet, {
    ArcjetDecision,
    createMiddleware,
    detectBot,
    fixedWindow,
    request,
    shield,
    slidingWindow,
    validateEmail,
} from "@arcjet/next";
import { getEnv } from "./utils";

// Re-export the rules to simplify imports inside handlers
export {
    detectBot,
    fixedWindow,
    shield,
    request,
    slidingWindow,
    validateEmail,
    createMiddleware,
    ArcjetDecision,
};

// Secures the digi disc from auth to server actions.
const aj = arcjet( {
    key: getEnv( 'ARCJET_API_KEY' ),
    rules: [],
} )

export default aj;
import arcjet from '@arcjet/next';
import { getEnv } from "@/lib/utils";

// Secures the digi disc from auth to server actions.
const aj = arcjet( {
    key: getEnv( 'ARCJET_API_KEY' ),
    rules: [],
} )

export default aj;
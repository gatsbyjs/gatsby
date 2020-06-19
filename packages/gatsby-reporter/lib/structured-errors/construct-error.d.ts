import { IConstructError, IStructuredError } from "./types";
declare const constructError: ({ details: { id, ...otherDetails }, }: IConstructError) => IStructuredError;
export default constructError;

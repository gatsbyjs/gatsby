import React from "react";
import { IGatsbyCLIState } from "../../redux/types";
interface ICLIProps {
    logs: IGatsbyCLIState;
    showStatusBar: boolean;
}
interface ICLIState {
    hasError: boolean;
    error?: Error;
}
declare class CLI extends React.Component<ICLIProps, ICLIState> {
    readonly state: ICLIState;
    memoizedReactElementsForMessages: React.ReactElement[];
    componentDidCatch(error: Error, info: React.ErrorInfo): void;
    static getDerivedStateFromError(error: Error): ICLIState;
    render(): React.ReactElement;
}
export default CLI;

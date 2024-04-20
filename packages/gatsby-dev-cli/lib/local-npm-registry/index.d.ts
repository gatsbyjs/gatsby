export declare function startVerdaccio(): Promise<unknown> | null;
export declare function publishPackagesLocallyAndInstall({ packagesToPublish, localPackages, packageNameToPath, ignorePackageJSONChanges, yarnWorkspaceRoot, externalRegistry, root, packageManager, }: {
    packagesToPublish: Array<string>;
    localPackages: Array<string>;
    packageNameToPath: Map<string, string>;
    ignorePackageJSONChanges: (packageName: string, strings: [string, string]) => any;
    yarnWorkspaceRoot?: string | null | undefined;
    externalRegistry: boolean;
    root: string;
    packageManager: "pnpm" | "npm";
}): Promise<void>;

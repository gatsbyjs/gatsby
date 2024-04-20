export declare function installPackages({ packagesToInstall, yarnWorkspaceRoot, newlyPublishedPackageVersions, externalRegistry, packageManager, }: {
    packagesToInstall: Array<string>;
    yarnWorkspaceRoot: string | null | undefined;
    newlyPublishedPackageVersions: Record<string, string>;
    externalRegistry: boolean;
    packageManager: `pnpm` | `npm`;
}): Promise<void>;

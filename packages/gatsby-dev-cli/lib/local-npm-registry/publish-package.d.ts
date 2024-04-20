export declare function publishPackage({ packageName, packagesToPublish, versionPostFix, ignorePackageJSONChanges, packageNameToPath, root, }: {
    root: string;
    packageName: string;
    packagesToPublish: Array<string>;
    versionPostFix: number;
    packageNameToPath: Map<string, string>;
    ignorePackageJSONChanges: (packageName: string, strings: [string, string]) => any;
}): Promise<any>;

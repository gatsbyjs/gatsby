export declare const verdaccioConfig: {
    storage: string;
    port: number;
    max_body_size: string;
    web: {
        enable: boolean;
        title: string;
    };
    self_path: string;
    logs: {
        type: string;
        format: string;
        level: string;
    };
    packages: {
        "**": {
            access: string;
            publish: string;
            proxy: string;
        };
    };
    uplinks: {
        npmjs: {
            url: string;
            max_fails: number;
        };
    };
};
export declare const registryUrl: string;

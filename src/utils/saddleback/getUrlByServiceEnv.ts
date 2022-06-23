export enum Service {
    Workflows = 'workflows',
    Event = 'event',
    Notifications = 'notifications',
    Core = 'core',
}

export enum Environment {
    Dev = 'dev',
    Stage = 'stage',
    Stage2 = 'stage2',
}

export const getUrlByServiceEnv = ({ env, service }: { service: Service; env: Environment }): string => {
    switch (service) {
        case Service.Core:
            return `hc-${env}.saddleback.com/api-doc/all/swagger.json`;
        case Service.Notifications:
            return `hc-notificationservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.Workflows:
            return `https://hc-workflowsservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.Event:
            return `hc-eventservice-${env}.azurewebsites.net/api-doc/all/swagger.json`;
    }
};

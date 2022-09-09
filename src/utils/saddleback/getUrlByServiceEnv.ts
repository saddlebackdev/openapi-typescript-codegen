export enum Service {
    Workflows = 'Workflows',
    Events = 'Events',
    Notifications = 'Notifications',
    Core = 'Core',
    Journey = 'Journey',
    Giving = 'Giving',
    SmallGroup = 'SmallGroup',
}

export enum Environment {
    Dev = 'dev',
    Stage = 'stage',
    Stage2 = 'stage2',
    Feature = 'feature',
}

export const getUrlByServiceEnv = ({ env, service }: { service: Service; env: Environment }): string => {
    switch (service) {
        case Service.Core:
            return `https://hc-${env}.saddleback.com/api-doc/all/swagger.json`;
        case Service.Notifications:
            return `https://hc-notificationservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.Workflows:
            return `https://hc-workflowsservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.Events:
            return `https://hc-eventservice-${env}.azurewebsites.net/api-doc/all/swagger.json`;
        case Service.Journey:
            return `https://hc-journeyservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.Giving:
            return `https://hc-givingservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
        case Service.SmallGroup:
            return `https://hc-smallgroupservice-${env}.azurewebsites.net/api-doc/v1/swagger.json`;
    }
};

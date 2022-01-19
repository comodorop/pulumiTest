import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";

// Create a load balancer to listen for requests and route them to the container.
const listener = new awsx.elasticloadbalancingv2.NetworkListener("nginx", { port: 80 });

import * as aws from "@pulumi/aws";

// pulumi config set test:Password HolaSecret
// pulumi config set --plaintext aws:region us-west-1

// Create a new KMS key

const key = new aws.kms.Key("a", {
    deletionWindowInDays: 10,
    description: "KMS key 1",
});

const secret1 = new aws.kms.Key("DB_USER", {
    deletionWindowInDays: 10,
    description: "ROOT",
});

const secret2 = new aws.kms.Key("DB_PASSWORD", {
    deletionWindowInDays: 10,
    description: "123456",
});

const config = new pulumi.Config();

// const superSecret = config.requireSecret("DB_USER");
let user = `${config.require("DB_USER")}`
let password = `${config.require("DB_PASSWORD")}`

console.log("****************")
console.log(user)
console.log(password)
console.log("****************")

// Define the service, building and publishing our "./app/Dockerfile", and using the load balancer.
const service = new awsx.ecs.FargateService("nginx", {
    desiredCount: 2,
    taskDefinitionArgs: {
        containers: {
            nginx: {
                image: awsx.ecs.Image.fromPath("nginx", "./app"),
                memory: 512,
                portMappings: [listener],
            },
        },
    },
});

// Export the URL so we can easily access it.
export const frontendURL = pulumi.interpolate `http://${listener.endpoint.hostname}/`;
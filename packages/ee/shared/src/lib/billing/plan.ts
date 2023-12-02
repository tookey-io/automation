import { BaseModelSchema } from "@activepieces/shared";
import { ProjectUsage } from "./usage";
import { Static, Type } from "@sinclair/typebox";

export type ProjectPlanId = string;

export const ProjectPlan = Type.Object({
    ...BaseModelSchema,
    projectId: Type.String(),
    stripeCustomerId: Type.String(),
    stripeSubscriptionId: Type.Union([Type.String(), Type.Null()]),
    subscriptionStartDatetime: Type.String(),
    flowPlanName: Type.String(),
    minimumPollingInterval: Type.Number(),
    connections: Type.Number(),
    teamMembers: Type.Number(),
    tasks: Type.Number(),
    tasksPerDay: Type.Union([Type.Number(), Type.Null()]),
})

export type ProjectPlan = Static<typeof ProjectPlan>

export type BillingResponse = {
    defaultPlan: { nickname: string; },
    usage: ProjectUsage,
    plan: ProjectPlan,
    customerPortalUrl: string
}

export type FlowPricingPlan = {
    name: string;
    description: string;
    includedTasks: number;
    includedUsers: number;
    pricePerUser: number;
    tasks: {
        pricePlanId: string;
        planPrice: number;
        unitAmount: number;
    }[];
    features: {
        tooltip: string;
        description: string;
    }[],
    custom: boolean;
    basePlanId?: string;
    contactUs: boolean;
    trail: boolean;
}


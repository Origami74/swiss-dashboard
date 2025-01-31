import type { type NostrEvent } from "@nostrify/nostrify";

export function getTag(event: NostrEvent, tagName: string) : string[] | undefined {
    const tagArray =  event.tags.filter(item => item[0] === tagName)

    if(!tagArray || tagArray.length === 0) return undefined;

    return tagArray.reduce(item => item[0]);
}

export function getTags(event: NostrEvent, tagName: string) : string[][] | undefined {
    const tagArray =  event.tags.filter(item => item[0] === tagName)

    if(!tagArray || tagArray.length === 0) return undefined;

    return tagArray;
}

export function getParams(event: NostrEvent){
    const paramMap = event.tags
        .filter(item => item[0] === "param") // Filter arrays that start with "param"
        .reduce((map, item) => {
            const key = item[1];
            const value = item[2]; // Convert the third element to a number
            map.set(key, value);
            return map;
        }, new Map<string, string>());

    return paramMap;
}

export const nostrNow = (): number => Math.floor(Date.now() / 1000);
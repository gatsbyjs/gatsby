 // NOTE: this function mutate the data argument object.
 // The behavior of this function is finding the `childAssets` object and check script
 // has exists in the array of webpack magic comment action. If exists. It mutate data.rel.
 export default function defineAssetScript(entryPoint, chunkFileName, data) {
   for (const objKey in entryPoint) {
     if (typeof entryPoint[objKey] == typeof {}) {
       if (objKey === `childAssets`) {
         Object.entries(entryPoint[objKey]).forEach(([key, value]) => {
           if (value.includes(chunkFileName)) {
             data.rel = key
           }
         })
       } else {
         defineAssetScript(entryPoint[objKey], chunkFileName, data)
       }
     }
   }
   return data
 }

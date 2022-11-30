import { shiftLeft } from "shift-left"
import { pluginErrorCodes as errorCodes } from "./errors"

const getErrorText = (context: IErrorContext): string => context.sourceMessage

export const ERROR_MAP: IErrorMap = {
  [errorCodes.bulkOperationFailed]: {
    text: getErrorText,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  [errorCodes.apiConflict]: {
    text: (): string => shiftLeft`
    Your operation was canceled. You might have another production site for this Shopify store.

    Shopify only allows one bulk operation at a time for a given shop, so we recommend that you
    avoid having two production sites that point to the same Shopify store.

    If the duplication is intentional, please wait for the other operation to finish before trying
    again. Otherwise, consider deleting the other site or pointing it to a test store instead.
  `,
    level: `ERROR`,
    category: `USER`,
    type: `PLUGIN`,
  },
  /**
   * If we don't know what it is, we haven't done our due
   * diligence to handle it explicitly. That means it's our
   * fault, so THIRD_PARTY indicates us, the plugin authors.
   */
  [errorCodes.unknownSourcingFailure]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
  [errorCodes.unknownApiError]: {
    text: getErrorText,
    level: `ERROR`,
    category: `THIRD_PARTY`,
    type: `PLUGIN`,
  },
}

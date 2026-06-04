// Agregar desencadenador lambda para darle el role a authenticado

export const handler = async (event) => {
    event.response = {
        claimsAndScopeOverrideDetails: {
            idTokenGeneration: {
                claimsToAddOrOverride: {
                    role: 'authenticated',
                },
            },
            accessTokenGeneration: {
                claimsToAddOrOverride: {
                    role: 'authenticated',
                },
            },
        },
    }
    return event
}
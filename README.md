# Instalar el CLI de Amplify

```ps
npm install -g @aws-amplify/cli
```

# Crear la App React

Crear el template de la aplicación _react_, usando typescript:

```ps
npx create-react-app mi-app --template typescript
```

# Configurar Amplify para nuestra App

Configuramos amplify:

```ps
cd mi-app

amplify configure
```

Especificamos los siguientes valores:

|Cuenta|Valor|
|-----|-----|
|euge|egsmartin@hotmail.com|
|Client ID|AKIAXBEVMWBDJKJG6AM4|
|Client Secret|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|

Instalamos las dependencias de Amplifly:

```ps
npm install aws-amplify @aws-amplify/ui-react
```

Lo inicializamos:

```ps
amplify init
```

# Codificación

```ps
npm install antd uuid
```

```ps
amplify add api


C:\Users\Eugenio\Downloads\app-gql>amplify add api
? Please select from one of the below mentioned services: GraphQL
? Provide API name: notesapi
? Choose the default authorization type for the API API key
? Enter a description for the API key: Mi clave de acceso
? After how many days from now the API key should expire (1-365): 365
? Do you want to configure advanced settings for the GraphQL API No, I am done.
? Do you have an annotated GraphQL schema? No
? Choose a schema template: One-to-many relationship (e.g., “Blogs” with “Posts” and “Comments”)
```

Elegimos GraphQL como tipo de API. En _amplify\backend\api\notesapi_ se genera el código. En _schema.graphql_ tenemos la definición del esquema:

```js
type Note @model {
  id: ID!
  clientId: ID
  name: String!
  description: String
  completed: Boolean
}
```
The GraphQL Transform library allows you to annotate a GraphQL schema with different directives like @model, @connection, @auth, and others. The @model directive we used in this schema will transform the base Note type into an expanded AWS AppSync GraphQL API complete with:

- Additional schema definitions for queries and mutations (Create, Read, Update, Delete, and List operations)
- Additional schema definitions for GraphQL subscriptions
- DynamoDB database
- Resolver code for all GraphQL operations mapped to DynamoDB database

Desplegamos la api:

```ps
amplify push

√ Generated GraphQL operations successfully and saved at src\graphql
√ Code generated successfully and saved in file src\API.ts
√ All resources are updated in the cloud

GraphQL endpoint: https://tl2do3hdpjgpjb4u2aakug5zse.appsync-api.eu-west-1.amazonaws.com/graphql
GraphQL API KEY: da2-btotoud4ufbl5japgddkfm5udm
```

Podemos probar la api - REST o GraphQL - usando la consola de amplify:

```ps
amplify console api
```

## Codigo

Añadimos en index.ts que vamos a utilizar _Amplify_:

```js
import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)
```


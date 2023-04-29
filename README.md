# BiteBox Food Delivery API

Para ejecutar la aplicación, usar el comando npm run start en la tarminal, estando ubicado en el directorio del repositorio/carpeta.

Para tener en cuenta:
- En la aplicación se crearon endpoints de función básica y otros especializados. Los endpoints de función básica son en su mayoría los mencionados en las tablas de endpoints de CRUDS, los especializados responden a necesidades o escenarios específicos de los flujos.
- Algunos endpoints, y dependiendo de la forma en que se usen, requieren autenticación de usuario, la cual se realiza a través del path /bitebox/login enviando las credenciales en el login. Las verificaciones se harán teniendo en cuenta el estado de la autenticación y el tipo de usuario que se autenticó.
- En caso de querer usar la base de datos ya creada, se pueden utilizar los archivos de dump en la carpeta DBDump para importar las collecciones de la base de datos BiteBox

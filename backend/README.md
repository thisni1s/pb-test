# PB Time System

Backend for a time keeping system based on PocketBase

The db schema and api rules are located in ```pb_schema.json``` and can be uploaded to pocketbase after initial installation

## Custom api routes

```/api/st_tasks/claim/:taskid``` -> returns task -> adds the requesting user to the claimed array, or removes them if they are already in it

```/api/st_tasks/finish/:taskid``` -> returns task -> marks a task as done

```/api/st_users/:id``` -> returns string -> gets the username of user with id

```/api/hello``` -> greets you

## Other Functions

Two ```OnRecordsListRequest``` functions add the usernames of the user relations at the end of the request so that they can be shown tho the user instead of ids.

Request answers look like this:

```
{
  "page": 1,
  "perPage": 20,
  "totalItems": 20,
  "totalPages": 1,
  "items": [<<items>>],
  "usernames":  [
    "userid": "username",
    "userid2": "username2"
  ]
}
```

One ```OnRecordAfterDeleteRequest``` function ensures that tasks are marked as undone if the last work entry for it is deleted

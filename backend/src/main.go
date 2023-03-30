// main.go
package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/hook"
)

func main() {
	app := pocketbase.New()

	app.OnRecordsListRequest("tasks").Add(func(e *core.RecordsListEvent) error {
		idNameList := make(map[string]string)
		for _, value := range e.Records {
			creatorId := value.GetString("creator")
			if idNameList[creatorId] == "" {
				record, err := app.Dao().FindRecordById("users", creatorId)
				if err == nil {
					idNameList[creatorId] = record.Username()
				}
			}

			claimedIds := value.GetStringSlice("claimed")
			for _, id := range claimedIds {
				if idNameList[id] == "" {
					record, err := app.Dao().FindRecordById("users", id)
					if err == nil {
						idNameList[id] = record.Username()
					}
				}
			}
		}

		for key, val := range idNameList {
			log.Println(key, val)
		}
		data := map[string]any{
			"page":       e.Result.Page,
			"perPage":    e.Result.PerPage,
			"totalItems": e.Result.TotalItems,
			"totalPages": e.Result.TotalPages,
			"items":      e.Result.Items,
			"usernames":  idNameList,
		}
		e.HttpContext.JSON(http.StatusOK, data)
		return hook.StopPropagation
	})

	app.OnRecordsListRequest("work_entries").Add(func(e *core.RecordsListEvent) error {
		idNameList := make(map[string]string)
		for _, value := range e.Records {
			userId := value.GetString("user")
			if idNameList[userId] == "" {
				record, err := app.Dao().FindRecordById("users", userId)
				if err == nil {
					idNameList[userId] = record.Username()
				}
			}
		}
		data := map[string]any{
			"page":       e.Result.Page,
			"perPage":    e.Result.PerPage,
			"totalItems": e.Result.TotalItems,
			"totalPages": e.Result.TotalPages,
			"items":      e.Result.Items,
			"usernames":  idNameList,
		}
		apis.EnrichRecords(e.HttpContext, app.Dao(), e.Result.Items.([]*models.Record))
		e.HttpContext.JSON(http.StatusOK, data)
		return hook.StopPropagation
	})

	app.OnRecordAfterDeleteRequest("work_entries").Add(func(e *core.RecordDeleteEvent) error {
		records, err := app.Dao().FindRecordsByExpr("work_entries", dbx.NewExp("task = {:taskid}", dbx.Params{"taskid": e.Record.GetString("task")}))
		if err != nil {
			return err
		}
		if len(records) == 0 {
			task, err := app.Dao().FindRecordById("tasks", e.Record.GetString("task"))
			if err != nil {
				return err
			}
			task.Set("done", false)
			if err := app.Dao().SaveRecord(task); err != nil {
				return err
			}
		}
		return nil
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// or you can also use the shorter e.Router.GET("/articles/:slug", handler, middlewares...)
		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/st_users/:id",
			Handler: func(c echo.Context) error {
				record, err := app.Dao().FindRecordById("users", c.PathParam("id"))
				if err != nil {
					return apis.NewNotFoundError("The user does not exist", err)
				}

				return c.JSON(http.StatusOK, record.Username())
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.ActivityLogger(app),
				apis.RequireRecordAuth(),
			},
		})

		return nil
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.AddRoute(echo.Route{
			Method: http.MethodGet,
			Path:   "/api/hello",
			Handler: func(c echo.Context) error {
				return c.String(http.StatusOK, "Hello world!")
			},
			Middlewares: []echo.MiddlewareFunc{
				apis.ActivityLogger(app),
			},
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}

}

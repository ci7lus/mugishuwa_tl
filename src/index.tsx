import React, { useEffect, useState } from "react"
import ReactDOM from "react-dom"
const logo = require("./assets/mugishuwa.svg")

type Action = {
  debuff: number
  remaining: number
  character: string
}

const App: React.FC<{}> = () => {
  const [err, setErr] = useState(null as string | null)
  const [timelineText, setTimelineText] = useState("")
  const [carryOver, setCarryOver] = useState(0)
  const [carryOverText, setCarryOverText] = useState("")
  const [totalDamage, setTotalDamage] = useState(null as number | null)
  const [timeline, setTimeline] = useState([] as Action[])
  const [generatedTimeline, setGeneratedTimeline] = useState(
    null as string | null
  )

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErr(null)
    try {
      if (0 < carryOverText.length && carryOverText.includes(":")) {
        const [minute, second] = carryOverText
          .split(":")
          .map((s) => parseInt(s))
        if (Number.isNaN(minute) || Number.isNaN(second)) {
          setErr("持ち越し時間の指定がおかしいです")
          return
        }
        setCarryOver(90 - (minute * 60 + second))
      }
      const splited = timelineText.split("\n")
      const totalDamageLine = splited.find((s) => s.startsWith("総ダメージ"))
      if (totalDamageLine) {
        const totalDamageFound = totalDamageLine.split(" ").pop()
        if (totalDamageFound) {
          setTotalDamage(parseInt(totalDamageFound))
        }
      } else {
        setTotalDamage(null)
      }
      const damages = splited.filter((s) => s.startsWith("↓"))
      if (damages.length === 0) {
        setErr("タイムテーブルが無効です")
        return
      }
      const res = damages.map((line) => {
        const [debuffText, remainingText, character] = line
          .replace("↓", "")
          .trim()
          .split(" ")
        const debuff = parseInt(debuffText)
        const [minute, second] = remainingText
          .split(":")
          .map((s) => parseInt(s))
        const totalSeconds = minute * 60 + second
        return {
          debuff,
          remaining: totalSeconds,
          character,
        } as Action
      })
      setTimeline(res)
      const generated = [
        totalDamageLine,
        res
          .map((line) => {
            const remaining = line.remaining - carryOver
            let minute = Math.floor(remaining / 60)
            if (minute < 0) {
              minute = 0
            }
            let second = remaining % 60
            if (second < 0) {
              second = 0
            }
            return `↓${line.debuff} ${minute}:${second
              .toString()
              .padStart(2, "0")} ${line.character}`
          })
          .join("\n"),
      ]
        .filter((s) => s)
        .join("\n\n")
      setGeneratedTimeline(generated)
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <div className="min-h-screen w-full flex flex-col text-gray-800">
      <div className="flex-1">
        <div className=" bg-gray-800">
          <div className="flex items-center container mx-auto flex justify-between max-w-screen-md text-gray-200">
            <div className="flex items-center justify-start">
              <a href="/">
                <div className="flex items-center justify-start mx-4 my-3">
                  <h1
                    className="font-bold text-lg"
                    style={{ fontFamily: "Avenir Next" }}
                  >
                    <img src={logo} width="100px" />
                  </h1>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-screen-md p-4">
          <form onSubmit={handleSubmitForm}>
            <div className="flex flex-wrap -mx-3">
              <div className="w-full px-3">
                <label
                  className="block tracking-wide text-gray-700 font-bold pb-2"
                  htmlFor="timetable"
                >
                  タイムテーブル
                </label>
                <textarea
                  id="timetable"
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight h-48"
                  onChange={(e) => {
                    setTimelineText(e.currentTarget.value)
                  }}
                  value={timelineText}
                ></textarea>
              </div>
            </div>
            <div className="flex items-center mb-6">
              <div className="w-2/3">
                <label
                  className="block text-gray-800 font-bold md:text-right mb-1 md:mb-0 pr-4"
                  htmlFor="carry_over"
                >
                  持ち越し時間
                </label>
              </div>
              <div className="w-1/3">
                <input
                  className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight"
                  id="carry_over"
                  type="text"
                  placeholder="1:10"
                  value={carryOverText}
                  onChange={(e) => {
                    setCarryOverText(e.currentTarget.value)
                  }}
                />
              </div>
            </div>
            <button
              className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 mb-2 rounded"
              type="submit"
            >
              変換
            </button>
            {err && <p className="text-gray-600 text-xs text-red-600">{err}</p>}
          </form>
          <div className="border-2 border-gray-200 my-4"></div>
          {totalDamage && (
            <div className="text-lg mb-2">トータルダメージ: {totalDamage}</div>
          )}
          <div className="w-full">
            <div className="shadow overflow-hidden rounded border-b border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      デバフ
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      時間
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      キャラクター
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {timeline.map((line, idx) => {
                    const remaining = line.remaining - carryOver
                    let minute = Math.floor(remaining / 60)
                    if (minute < 0) {
                      minute = 0
                    }
                    let second = remaining % 60
                    if (second < 0) {
                      second = 0
                    }
                    return (
                      <tr key={idx}>
                        <td className="text-left py-1 px-4">{line.debuff}</td>
                        <td className="text-left py-1 px-4">
                          {minute}:{second.toString().padStart(2, "0")} (
                          {remaining}秒)
                        </td>
                        <td className="text-left py-1 px-4">
                          {line.character}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {generatedTimeline && (
            <>
              <textarea
                className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 my-3 leading-tight h-48"
                readOnly={true}
                value={generatedTimeline}
              ></textarea>
              <div className="flex justify-end">
                <button
                  className="shadow bg-teal-400 hover:bg-teal-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 mb-2 rounded text-right"
                  type="button"
                  onClick={async () => {
                    try {
                      if (navigator.clipboard) {
                        await navigator.clipboard.writeText(generatedTimeline)
                        alert("コピーしました")
                      }
                    } catch (e) {
                      console.error(e)
                    }
                  }}
                >
                  コピー
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-gray-800">
        <div className="container mx-auto max-w-screen-md">
          <div className="flex justify-end text-xs p-4 text-gray-200">
            mugishuwa
            {/**&nbsp;/&nbsp;
            <a
              className="text-blue-400"
              target="_blank"
              href="https://github.com/ci7lus/mugishuwa"
              rel="noopener"
            >
              code
            </a>**/}
          </div>
        </div>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById("app"))

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";

describe("H5 card game", () => {
  beforeEach(() => localStorage.clear());

  it("reveals a card and can add it to the collection", () => {
    render(<App random={() => 0} />);
    fireEvent.click(screen.getByRole("button", { name: "抽取角色" }));

    expect(screen.getByText("恭喜获得新角色")).toBeInTheDocument();
    expect(screen.getByText("岗位详细介绍")).toBeInTheDocument();
    expect(screen.getByText("日常能帮你做什么")).toBeInTheDocument();
    expect(screen.getByText(/产品负责人负责把业务目标/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看完整使用指南" }));
    expect(screen.getByText("如何让他使用这些能力")).toBeInTheDocument();
    expect(screen.getByText("可直接使用的召唤口令")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    fireEvent.click(screen.getByRole("button", { name: "收入收藏" }));
    fireEvent.click(screen.getByRole("button", { name: /收藏/ }));

    expect(screen.getByText("布尔玛")).toBeInTheDocument();
  });

  it("opens the skill pack and filters cards", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "技能包" }));
    fireEvent.click(screen.getByRole("button", { name: "测试" }));

    expect(screen.getByText("6 张角色卡")).toBeInTheDocument();
  });
});

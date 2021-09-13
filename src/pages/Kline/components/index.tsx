import React from "react";
import { createPortal } from "react-dom";
import "./index.less";
interface ContextMenuProps {
  style?: React.CSSProperties | undefined;
  visible?: boolean;
  onCancel?: () => void;
  onOk?: (data: any) => void;
  instrumentId?: string;
  optionalList: Array<any>;
}
interface ContextMenuState {}
class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
  private documentClick: any = null;
  state = {};

  private contextMenuNode = null as any;
  constructor(props: ContextMenuProps) {
    super(props);
    this.contextMenuNode = document.createElement("div");
    document.body.appendChild(this.contextMenuNode);
  }

  componentDidMount() {
    this.documentClick = this.onDocumentClick.bind(this);
    document.addEventListener("click", this.documentClick, false);
  }

  private optionExist(optionalList: Array<any>, instrumentId: any) {
    return optionalList.indexOf(instrumentId) > -1;
  }

  private onDocumentClick() {
    this.onCancel();
  }

  private onCancel() {
    const { onCancel } = this.props;
    onCancel && onCancel();
  }

  private onOk(optionalList: Array<any>) {
    const { onOk } = this.props;
    onOk && onOk(optionalList);
  }

  private onMenuClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    e.stopPropagation();
    console.log("menu click!");
  }

  addToOptionalList(instrumentId: any) {
    const { optionalList = [] } = this.props;
    optionalList.push(instrumentId);
    this.onOk(optionalList);
  }

  removeFromOptionalList(instrumentId: any) {
    let { optionalList = [] } = this.props;
    optionalList = optionalList.filter((item) => item !== instrumentId);
    this.onOk(optionalList);
  }

  componentWillMount() {
    document.removeEventListener("click", this.documentClick, false);
  }

  render() {
    const { style, visible, instrumentId, optionalList } = this.props;
    const exist = this.optionExist(optionalList, instrumentId);
    return createPortal(
      visible && (
        <div
          style={style}
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            this.onMenuClick(e)
          }
          className="context-menu"
        >
          {!exist && (
            <div
              onClick={() => this.addToOptionalList(instrumentId)}
              className="pointer l-h-20 h-20"
            >
              加入自选列表
            </div>
          )}
          {exist && (
            <div
              className="pointer l-h-20 h-20"
              onClick={() => this.removeFromOptionalList(instrumentId)}
            >
              从自选列表删除
            </div>
          )}
        </div>
      ),
      this.contextMenuNode
    );
  }
}
export default ContextMenu;

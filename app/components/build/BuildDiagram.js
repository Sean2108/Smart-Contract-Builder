import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import {TrayWidget} from "./diagram/TrayWidget";
import {TrayItemWidget} from "./diagram/TrayItemWidget";
import {DiamondNodeModel} from "./diagram/DiamondNodeModel";
import {DiamondNodeFactory} from "./diagram/DiamondNodeFactory";
import {SimplePortFactory} from "./diagram/SimplePortFactory";
import {DiamondPortModel} from "./diagram/DiamondPortModel";
import {DiagramEngine, DiagramModel, DefaultNodeModel, LinkModel, DiagramWidget} from "storm-react-diagrams";
import DiagramModal from './diagram/DiagramModal';

const styles = theme => ({
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: 'theme.palette.text.secondary'
    }
});

class BuildDiagram extends React.Component {
    state = {
        open: false,
        type: '',
        points: null
    }

    engine;
    start;

    constructor(props) {
        super(props);
        // setup the diagram engine
        this.engine = new DiagramEngine();
        this
            .engine
            .installDefaultFactories();
        this
            .engine
            .registerPortFactory(new SimplePortFactory("diamond", config => new DiamondPortModel()));
        this
            .engine
            .registerNodeFactory(new DiamondNodeFactory());

        // setup the diagram model
        const model = new DiagramModel();
        this.start = new DefaultNodeModel("Start", "rgb(0,192,255)");
        var startOut = this.start.addOutPort(" ");
        startOut.setMaximumLinks(1);
        this.start.setPosition(100, 100);

        //4) add the models to the root graph
        model.addAll(this.start);

        // load model into engine and render
        this
            .engine
            .setDiagramModel(model);
    }

    createDefaultNode(label, color, isReturn) {
        var node = new DefaultNodeModel(label, color);
        node.addInPort(" ");
        if (!isReturn) {
            let outPort = node.addOutPort(" ");
            outPort.setMaximumLinks(1);
        }
        return node;
    }

    selectNode(type, desc) {
        switch (type) {
            case "assignment":
                return this.createDefaultNode(`Assignment: ${desc}`, "rgb(192,0,0)", false);
            case "event":
                return this.createDefaultNode(`Emit Event: ${desc}`, "rgb(0,192,0)", false);
            case "transfer":
                return this.createDefaultNode(`Transfer ${desc}`, "rgb(255,100,0)", false);
            case "return":
                return this.createDefaultNode(`Return ${desc}`, "rgb(192,255,0)", true);
            case "conditional":
                return new DiamondNodeModel(`${desc}`);
        }
        return null;
    }

    addNode(info) {
        let node = this.selectNode(this.state.type, info);
        this.props.onChangeLogic(this.generateCode());
        node.x = this.state.points.x;
        node.y = this.state.points.y;
        this
            .engine
            .getDiagramModel()
            .addNode(node);
        this.forceUpdate();
    }

    generateCode() {
        let code = '';
        let nextNode = this.traverseNextNode(this.start);
        while (nextNode) {
            code += nextNode instanceof DefaultNodeModel ? nextNode.name : nextNode.id + ';\n';
            nextNode = this.traverseNextNode(nextNode);
        }
        console.log(code);
        return code;
    }

    traverseNextNode(node) {
        let outPort;
        if (node instanceof DiamondNodeModel) {
            outPort = node.outPortTrue;
        }
        else {
            if (node.getOutPorts.length === 0) {
                return null;
            }
            outPort = node.getOutPorts()[0];
        }
        let links = Object.values(outPort.getLinks());
        if (links.length === 0) {
            return null;
        }
        else {
            return links[0].targetPort.getNode();
        }
    }

    render() {
        const {classes, theme, varList, events} = this.props;

        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > Action Phase < /Typography>
        <DiagramModal open={this.state.open} close={() => {this.setState({open: false})}} submit={(info)=>this.addNode(info)} type={this.state.type} varList={varList} events={events} addNode={this.addNode}/ > < div className = "body" > < div className = "header" > < div className = "title" > Nodes < /div > < /div > < div className = "content" > < TrayWidget > 
        < TrayItemWidget model = {
            {
                type: "assignment"
            }
        }
        name = "Assignment Node" color = "rgb(192,0,0)" /> < TrayItemWidget model = {
            {
                type: "event"
            }
        }
        name = "Event Node" color = "rgb(0,192,0)" /> < TrayItemWidget model = {
            {
                type: "transfer"
            }
        }
        name = "Transfer Node" color = "rgb(255,0,192)" /> < TrayItemWidget model = {
            {
                type: "return"
            }
        }
        name = "Return Node" color = "rgb(255,100,0)" /> < TrayItemWidget model = {
            {
                type: "conditional"
            }
        }
        name = "Conditional Node" color = "rgb(192,0,255)" /> < /TrayWidget> <
      div className="diagram-layer"
                    onDrop={
                      event => {
                        var data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
                        this.setState({open: true, type: data.type, points: this.engine.getRelativeMousePoint(event)});
                      }
                    }
                    onDragOver={
                      event => {
                        event.preventDefault();
                      }
                    } >
                    <
                      DiagramWidget diagramEngine={
                        this.engine
                      }
                      className="srd-canvas"
                      allowLooseLinks={
                        false
                      }
                    / > < /
      div > <
      /div > < /
      div >
              
      <
      /Paper >);
    }
}

BuildDiagram.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    varList: PropTypes.array.isRequired,
    events: PropTypes.object.isRequired,
    onChangeLogic: PropTypes.func.isRequired
};

export default withStyles(styles, {withTheme: true})(BuildDiagram);
